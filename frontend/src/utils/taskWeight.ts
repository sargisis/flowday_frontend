import type { Task } from '../api/tasks';

/**
 * Calculate task weight/effort based on various factors
 * Similar to GitHub's contribution intensity
 */
export function calculateTaskWeight(task: Task): number {
    let weight = 1; // Base weight

    // Priority multiplier
    const priorityMultiplier = {
        'high': 3,
        'medium': 2,
        'low': 1,
    };
    const priority = task.priority?.toLowerCase() || 'medium';
    weight *= priorityMultiplier[priority as keyof typeof priorityMultiplier] || 2;

    // Subtasks multiplier (more subtasks = more work)
    if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        const totalSubtasks = task.subtasks.length;
        // Weight increases with subtasks, especially if many are completed
        weight += Math.min(totalSubtasks * 0.5, 3);
        // Bonus if all subtasks completed (task was fully done)
        if (completedSubtasks === totalSubtasks && totalSubtasks > 0) {
            weight += 1;
        }
    }

    // Description length multiplier (longer description = more complex)
    if (task.description) {
        const descLength = task.description.length;
        if (descLength > 500) weight += 1;
        if (descLength > 1000) weight += 1;
    }

    // Attachments multiplier (more attachments = more work)
    if (task.attachments && task.attachments.length > 0) {
        weight += Math.min(task.attachments.length * 0.3, 1);
    }

    return Math.round(weight * 10) / 10; // Round to 1 decimal
}

/**
 * Get activity intensity level (0-4) for GitHub-like visualization
 */
export function getActivityIntensity(weight: number, maxWeight: number): 0 | 1 | 2 | 3 | 4 {
    if (weight === 0) return 0;
    if (maxWeight === 0) return 0;
    
    const ratio = weight / maxWeight;
    
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
}
