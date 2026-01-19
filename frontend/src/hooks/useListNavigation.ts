import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseListNavigationOptions<T> {
    items: T[];
    onSelect?: (item: T, index: number) => void;
    onActivate?: (item: T, index: number) => void;
    enabled?: boolean;
    getId?: (item: T) => string;
    loop?: boolean; // Loop through items
}

/**
 * Hook for keyboard navigation in lists (arrow keys, Enter, etc.)
 */
export function useListNavigation<T>({
    items,
    onSelect,
    onActivate,
    enabled = true,
    getId = (item: T) => (item as any).id,
    loop = true,
}: UseListNavigationOptions<T>) {
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const selectedIndexRef = useRef(selectedIndex);

    // Keep ref in sync
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    // Reset selection when items change
    useEffect(() => {
        if (selectedIndex >= items.length) {
            setSelectedIndex(Math.max(-1, items.length - 1));
        }
    }, [items.length, selectedIndex]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled || items.length === 0) return;

        // Ignore if typing in input/textarea
        const target = e.target as HTMLElement;
        if (
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
            target.isContentEditable
        ) {
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => {
                    const next = prev + 1;
                    if (next >= items.length) {
                        return loop ? 0 : items.length - 1;
                    }
                    return next;
                });
                break;

            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => {
                    const next = prev - 1;
                    if (next < 0) {
                        return loop ? items.length - 1 : 0;
                    }
                    return next;
                });
                break;

            case 'Home':
                e.preventDefault();
                setSelectedIndex(0);
                break;

            case 'End':
                e.preventDefault();
                setSelectedIndex(items.length - 1);
                break;

            case 'Enter':
                if (selectedIndexRef.current >= 0 && selectedIndexRef.current < items.length) {
                    e.preventDefault();
                    const item = items[selectedIndexRef.current];
                    onActivate?.(item, selectedIndexRef.current);
                }
                break;
        }
    }, [enabled, items, loop, onActivate]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);

    // Call onSelect when selection changes
    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            onSelect?.(items[selectedIndex], selectedIndex);
        }
    }, [selectedIndex, items, onSelect]);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            const itemId = getId(items[selectedIndex]);
            const element = document.getElementById(`task-item-${itemId}`);
            if (element) {
                element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex, items, getId]);

    return {
        selectedIndex,
        setSelectedIndex,
        selectedItem: selectedIndex >= 0 && selectedIndex < items.length ? items[selectedIndex] : null,
    };
}
