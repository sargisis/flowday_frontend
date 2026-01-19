import { useState, useEffect } from 'react';

export interface CustomShortcut {
    action: string;
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
}

const STORAGE_KEY = 'flowday_custom_shortcuts';

const DEFAULT_SHORTCUTS: CustomShortcut[] = [
    { action: 'create_task', key: 'c' },
    { action: 'search', key: '/' },
    { action: 'select_mode', key: 's' },
    { action: 'save', key: 's', ctrl: true },
    { action: 'delete', key: 'Delete' },
    { action: 'quick_add', key: 'q' },
    { action: 'edit_task', key: 'e' },
    { action: 'focus_mode', key: 'f' },
];

export function useCustomShortcuts() {
    const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>([]);

    useEffect(() => {
        // Load from localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCustomShortcuts(JSON.parse(stored));
            } else {
                setCustomShortcuts(DEFAULT_SHORTCUTS);
            }
        } catch (error) {
            console.error('Failed to load custom shortcuts:', error);
            setCustomShortcuts(DEFAULT_SHORTCUTS);
        }
    }, []);

    const updateShortcut = (action: string, shortcut: Partial<CustomShortcut>) => {
        const updated = customShortcuts.map(s =>
            s.action === action ? { ...s, ...shortcut } : s
        );
        setCustomShortcuts(updated);
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save shortcut:', error);
        }
    };

    const resetToDefaults = () => {
        setCustomShortcuts(DEFAULT_SHORTCUTS);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SHORTCUTS));
        } catch (error) {
            console.error('Failed to reset shortcuts:', error);
        }
    };

    const getShortcut = (action: string): CustomShortcut | undefined => {
        return customShortcuts.find(s => s.action === action);
    };

    return {
        customShortcuts,
        updateShortcut,
        resetToDefaults,
        getShortcut,
    };
}
