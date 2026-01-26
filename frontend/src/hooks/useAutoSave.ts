import { useEffect, useRef, useState } from 'react';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = ((...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
}

interface UseAutoSaveOptions<T> {
    data: T;
    onSave: (data: T) => void | Promise<void>;
    storageKey?: string; // Key for localStorage
    delay?: number; // Debounce delay in ms
    enabled?: boolean;
    flushOnUnmount?: boolean; // Force save on component unmount
    serialize?: (data: T) => string;
    deserialize?: (str: string) => T;
}

export function useAutoSave<T>({
    data,
    onSave,
    storageKey,
    delay = 2000,
    enabled = true,
    flushOnUnmount = true, // Default to true to prevent data loss
    serialize = JSON.stringify,
    deserialize = JSON.parse,
}: UseAutoSaveOptions<T>) {
    const isInitialMount = useRef(true);
    const previousDataRef = useRef<T>(data);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Keep onSave stable to avoid redundant effect triggers
    const onSaveRef = useRef(onSave);
    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    const debouncedSave = useRef(
        debounce(async (dataToSave: T) => {
            setIsSaving(true);
            try {
                await onSaveRef.current(dataToSave);
                setLastSaved(new Date());

                // Save to localStorage if storageKey provided
                if (storageKey) {
                    try {
                        localStorage.setItem(storageKey, serialize(dataToSave));
                    } catch (err) {
                        console.warn('Failed to save to localStorage:', err);
                    }
                }
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        }, delay)
    ).current;

    // Load from localStorage on mount if storageKey provided
    useEffect(() => {
        if (storageKey && enabled) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = deserialize(saved);
                    // Only restore if data is empty/default
                    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
                        // Call onSaveRef.current with restored data
                        const result = onSaveRef.current(parsed);
                        if (result instanceof Promise) {
                            result.catch(console.error);
                        }
                    }
                }
            } catch (err) {
                console.warn('Failed to load from localStorage:', err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey, enabled]); // Only run once when storageKey/enabled changes

    useEffect(() => {
        if (!enabled) return;

        // Skip on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            previousDataRef.current = data;
            return;
        }

        // Only save if data actually changed
        if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
            previousDataRef.current = data;
            debouncedSave(data);
        }
    }, [data, enabled, debouncedSave]);

    // Flush pending saves on unmount to prevent data loss
    useEffect(() => {
        return () => {
            if (flushOnUnmount && enabled) {
                // Cancel debounced save and execute immediately
                debouncedSave.cancel();

                // Execute save synchronously if possible
                const result = onSaveRef.current(previousDataRef.current);
                if (result instanceof Promise) {
                    // For async saves, we can't wait but at least trigger it
                    result.catch(err => {
                        console.error('Failed to flush autosave on unmount:', err);
                    });
                }
            }
        };
        // Explicitly excluding onSaveRef since it's a ref and we want to break the loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flushOnUnmount, enabled, debouncedSave]);

    // Clear localStorage when component unmounts (optional - can be controlled)
    const clearDraft = () => {
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
    };

    return { clearDraft, isSaving, lastSaved };
}
