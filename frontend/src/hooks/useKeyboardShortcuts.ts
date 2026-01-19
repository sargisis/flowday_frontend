import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea/select
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        // Handle special keys like '?' which require Shift
        let keyMatch: boolean;
        if (shortcut.key === '?' && shortcut.shift) {
          // For '?' with shift, check if Shift is pressed and key is '?' or '/'
          // On some keyboards, Shift+/ produces '?'
          keyMatch = e.shiftKey && (e.key === '?' || (e.key === '/' && e.shiftKey));
        } else if (shortcut.key === 'Escape') {
          // Escape key is case-sensitive
          keyMatch = e.key === 'Escape';
        } else {
          // Case-insensitive matching for regular keys
          keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        }
        
        // Check modifiers - if shortcut requires a modifier, it must be pressed
        // If shortcut doesn't require a modifier, that modifier must NOT be pressed
        const ctrlMatch = shortcut.ctrl !== undefined 
          ? (shortcut.ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey))
          : true; // If not specified, don't check
        const shiftMatch = shortcut.shift !== undefined
          ? (shortcut.shift ? e.shiftKey : !e.shiftKey)
          : true; // If not specified, don't check
        const altMatch = shortcut.alt !== undefined
          ? (shortcut.alt ? e.altKey : !e.altKey)
          : true; // If not specified, don't check
        const metaMatch = shortcut.meta !== undefined
          ? (shortcut.meta ? e.metaKey : !e.metaKey)
          : true; // If not specified, don't check

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          e.preventDefault();
          e.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Predefined shortcuts for common actions
export const COMMON_SHORTCUTS = {
  CREATE_TASK: { key: 'c', description: 'Create new task' },
  SEARCH: { key: '/', description: 'Focus search' },
  SELECT_MODE: { key: 's', description: 'Toggle selection mode' },
  ESCAPE: { key: 'Escape', description: 'Cancel/Close' },
  SAVE: { key: 's', ctrl: true, description: 'Save (Ctrl+S)' },
  DELETE: { key: 'Delete', description: 'Delete selected' },
  QUICK_ADD: { key: 'q', description: 'Quick add task' },
};
