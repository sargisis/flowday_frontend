import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
    initialValue: T;
    maxHistory?: number;
}

export function useUndoRedo<T>({ initialValue, maxHistory = 50 }: UseUndoRedoOptions<T>) {
    const [history, setHistory] = useState<T[]>([initialValue]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const isUndoRedoRef = useRef(false);

    const current = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const setValue = useCallback((newValue: T, addToHistory = true) => {
        // If this is from undo/redo, don't add to history
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }

        if (!addToHistory) {
            // Just update current value without adding to history
            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[currentIndex] = newValue;
                return newHistory;
            });
            return;
        }

        setHistory(prev => {
            // Remove any "future" history if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(newValue);
            
            // Limit history size
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                setCurrentIndex(prev => Math.min(prev, maxHistory - 2));
                return newHistory;
            }
            
            return newHistory;
        });
        setCurrentIndex(prev => {
            const newIndex = prev + 1;
            return Math.min(newIndex, maxHistory - 1);
        });
    }, [currentIndex, maxHistory]);

    const undo = useCallback(() => {
        if (canUndo) {
            isUndoRedoRef.current = true;
            setCurrentIndex(prev => prev - 1);
        }
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) {
            isUndoRedoRef.current = true;
            setCurrentIndex(prev => prev + 1);
        }
    }, [canRedo]);

    const reset = useCallback((newValue: T) => {
        setHistory([newValue]);
        setCurrentIndex(0);
    }, []);

    return {
        current,
        setValue,
        undo,
        redo,
        reset,
        canUndo,
        canRedo,
        historyLength: history.length,
        currentHistoryIndex: currentIndex,
    };
}
