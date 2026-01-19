import type { Task } from '../api/tasks';
import type { Comment } from '../api/comments';

export interface SearchFilters {
    status?: string[];
    priority?: string[];
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    searchInComments?: boolean;
}

export interface SearchResult {
    task: Task;
    matchScore: number;
    matchedFields: string[];
    highlightedTitle: string;
    highlightedDescription?: string;
}

/**
 * Simple fuzzy search - calculates similarity between strings
 * Returns a score from 0 to 1
 */
export function fuzzyMatch(query: string, text: string): number {
    if (!query || !text) return 0;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower === queryLower) return 1;
    
    // Starts with query
    if (textLower.startsWith(queryLower)) return 0.9;
    
    // Contains query
    if (textLower.includes(queryLower)) return 0.7;
    
    // Fuzzy match - check if all query characters appear in order
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
        if (textLower[i] === queryLower[queryIndex]) {
            queryIndex++;
        }
    }
    
    if (queryIndex === queryLower.length) {
        // All characters found in order, but not consecutive
        return 0.5;
    }
    
    // Calculate character similarity
    const commonChars = queryLower.split('').filter(char => textLower.includes(char)).length;
    return commonChars / queryLower.length * 0.3;
}

/**
 * Highlight matching text in a string
 */
export function highlightText(text: string, query: string): string {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-indigo-500/30 text-indigo-300 px-0.5 rounded">$1</mark>');
}

/**
 * Search tasks with filters and fuzzy matching
 */
export function searchTasks(
    tasks: Task[],
    query: string,
    filters: SearchFilters = {},
    commentsMap?: Map<string, Comment[]>
): SearchResult[] {
    if (!query.trim() && Object.keys(filters).length === 0) {
        return [];
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase().trim();

    tasks.forEach(task => {
        let matchScore = 0;
        const matchedFields: string[] = [];
        let highlightedTitle = task.title;
        let highlightedDescription = task.description || '';

        // Apply filters first
        if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(task.status.toLowerCase())) {
                return; // Skip this task
            }
        }

        if (filters.priority && filters.priority.length > 0) {
            if (!filters.priority.includes(task.priority.toLowerCase())) {
                return; // Skip this task
            }
        }

        if (filters.projectId && task.project_id !== filters.projectId) {
            return; // Skip this task
        }

        if (filters.dateFrom || filters.dateTo) {
            if (task.created_at) {
                const taskDate = new Date(task.created_at).toISOString().split('T')[0];
                if (filters.dateFrom && taskDate < filters.dateFrom) return;
                if (filters.dateTo && taskDate > filters.dateTo) return;
            } else {
                return; // Skip tasks without date if date filter is set
            }
        }

        // If no query, return all filtered tasks
        if (!queryLower) {
            results.push({
                task,
                matchScore: 1,
                matchedFields: ['filter'],
                highlightedTitle: task.title,
                highlightedDescription: task.description,
            });
            return;
        }

        // Search in title
        const titleScore = fuzzyMatch(queryLower, task.title);
        if (titleScore > 0) {
            matchScore += titleScore * 2; // Title is more important
            matchedFields.push('title');
            highlightedTitle = highlightText(task.title, query);
        }

        // Search in description
        if (task.description) {
            const descScore = fuzzyMatch(queryLower, task.description);
            if (descScore > 0) {
                matchScore += descScore;
                matchedFields.push('description');
                highlightedDescription = highlightText(task.description, query);
            }
        }

        // Search in status and priority
        if (task.status.toLowerCase().includes(queryLower)) {
            matchScore += 0.3;
            matchedFields.push('status');
        }
        if (task.priority.toLowerCase().includes(queryLower)) {
            matchScore += 0.3;
            matchedFields.push('priority');
        }

        // Search in comments if enabled
        if (filters.searchInComments && commentsMap) {
            const comments = commentsMap.get(task.id) || [];
            const commentMatch = comments.some(comment => 
                comment.content.toLowerCase().includes(queryLower)
            );
            if (commentMatch) {
                matchScore += 0.5;
                matchedFields.push('comments');
            }
        }

        if (matchScore > 0) {
            results.push({
                task,
                matchScore,
                matchedFields,
                highlightedTitle,
                highlightedDescription,
            });
        }
    });

    // Sort by match score (highest first)
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results;
}

/**
 * Parse search query for filters (e.g., "status:done priority:high")
 */
export function parseSearchQuery(query: string): { searchText: string; filters: Partial<SearchFilters> } {
    const filters: Partial<SearchFilters> = {};
    let searchText = query;

    // Parse status filter
    const statusMatch = query.match(/status:(\w+)/i);
    if (statusMatch) {
        filters.status = [statusMatch[1].toLowerCase()];
        searchText = searchText.replace(/status:\w+/gi, '').trim();
    }

    // Parse priority filter
    const priorityMatch = query.match(/priority:(\w+)/i);
    if (priorityMatch) {
        filters.priority = [priorityMatch[1].toLowerCase()];
        searchText = searchText.replace(/priority:\w+/gi, '').trim();
    }

    // Parse date filters
    const dateFromMatch = query.match(/from:(\d{4}-\d{2}-\d{2})/i);
    if (dateFromMatch) {
        filters.dateFrom = dateFromMatch[1];
        searchText = searchText.replace(/from:\d{4}-\d{2}-\d{2}/gi, '').trim();
    }

    const dateToMatch = query.match(/to:(\d{4}-\d{2}-\d{2})/i);
    if (dateToMatch) {
        filters.dateTo = dateToMatch[1];
        searchText = searchText.replace(/to:\d{4}-\d{2}-\d{2}/gi, '').trim();
    }

    // Parse comments search
    if (query.includes('in:comments') || query.includes('comments:')) {
        filters.searchInComments = true;
        searchText = searchText.replace(/in:comments|comments:/gi, '').trim();
    }

    return { searchText, filters };
}
