import { useState, useEffect } from 'react';

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters?: {
        status?: string[];
        priority?: string[];
        projectId?: string;
        dateFrom?: string;
        dateTo?: string;
        searchInComments?: boolean;
    };
    createdAt: string;
}

const STORAGE_KEY = 'flowday_saved_searches';

export function useSavedSearches() {
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

    useEffect(() => {
        // Load from localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSavedSearches(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load saved searches:', error);
        }
    }, []);

    const saveSearch = (name: string, query: string, filters?: SavedSearch['filters']) => {
        const newSearch: SavedSearch = {
            id: Date.now().toString(),
            name,
            query,
            filters,
            createdAt: new Date().toISOString(),
        };

        const updated = [newSearch, ...savedSearches].slice(0, 10); // Keep max 10
        setSavedSearches(updated);
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save search:', error);
        }

        return newSearch;
    };

    const deleteSearch = (id: string) => {
        const updated = savedSearches.filter(s => s.id !== id);
        setSavedSearches(updated);
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to delete search:', error);
        }
    };

    return {
        savedSearches,
        saveSearch,
        deleteSearch,
    };
}
