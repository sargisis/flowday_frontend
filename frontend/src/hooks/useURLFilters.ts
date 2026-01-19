import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TaskFilters, TaskSort } from '../types/filters';

export function useURLFilters() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<TaskFilters>(() => {
        // Initialize from URL
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        
        return {
            status: status ? status.split(',') as any : undefined,
            priority: priority ? priority.split(',') as any : undefined,
            search: search || undefined,
        };
    });

    const [sort, setSort] = useState<TaskSort>(() => {
        const sortField = searchParams.get('sortField') as any;
        const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc';
        
        return sortField ? {
            field: sortField,
            direction: sortDirection || 'asc',
        } : { field: 'title', direction: 'asc' };
    });

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (filters.status && filters.status.length > 0) {
            params.set('status', filters.status.join(','));
        }
        if (filters.priority && filters.priority.length > 0) {
            params.set('priority', filters.priority.join(','));
        }
        if (filters.search) {
            params.set('search', filters.search);
        }
        if (sort.field !== 'title' || sort.direction !== 'asc') {
            params.set('sortField', sort.field);
            params.set('sortDirection', sort.direction);
        }

        setSearchParams(params, { replace: true });
    }, [filters, sort, setSearchParams]);

    const updateFilters = useCallback((newFilters: TaskFilters) => {
        setFilters(newFilters);
    }, []);

    const updateSort = useCallback((newSort: TaskSort) => {
        setSort(newSort);
    }, []);

    return { filters, sort, updateFilters, updateSort };
}
