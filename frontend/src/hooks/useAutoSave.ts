import { useEffect, useRef } from 'react';

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
    serialize?: (data: T) => string;
    deserialize?: (str: string) => T;
}

export function useAutoSave<T>({ 
    data, 
    onSave, 
    storageKey,
    delay = 2000, 
    enabled = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
}: UseAutoSaveOptions<T>) {
    const isInitialMount = useRef(true);
    const previousDataRef = useRef<T>(data);
    const debouncedSave = useRef(
        debounce(async (dataToSave: T) => {
            try {
                await onSave(dataToSave);
                
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
                        // Call onSave with restored data
                        const result = onSave(parsed);
                        if (result instanceof Promise) {
                            result.catch(console.error);
                        }
                    }
                }
            } catch (err) {
                console.warn('Failed to load from localStorage:', err);
            }
        }
    }, [storageKey]); // Only run once on mount

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

        return () => {
            debouncedSave.cancel();
        };
    }, [data, enabled, debouncedSave]);

    // Clear localStorage when component unmounts (optional - can be controlled)
    const clearDraft = () => {
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
    };

    return { clearDraft };
}
