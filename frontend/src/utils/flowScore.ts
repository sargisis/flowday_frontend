import type { Task } from '../api/tasks';

export interface FlowScoreMetrics {
    score: number; // 0-100
    factors: {
        completionRate: number; // % of tasks completed
        focusTime: number; // Total focus minutes
        consistency: number; // Daily activity consistency
        velocity: number; // Tasks completed per day
        quality: number; // Based on high-priority completion
    };
    breakdown: {
        completionWeight: number;
        focusWeight: number;
        consistencyWeight: number;
        velocityWeight: number;
        qualityWeight: number;
    };
}

/**
 * Calculate Flow Score based on multiple factors
 * Flow Score = weighted average of:
 * - Completion Rate (30%)
 * - Focus Time (25%)
 * - Consistency (20%)
 * - Velocity (15%)
 * - Quality (10%)
 */
export function calculateFlowScore(
    tasks: Task[],
    focusSessions: Array<{ duration: number; date: string }> = [],
    daysRange: number = 30
): FlowScoreMetrics {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysRange);

    // Filter tasks in range
    const tasksInRange = tasks.filter(task => {
        if (!task.created_at) return false;
        const created = new Date(task.created_at);
        return created >= startDate;
    });

    // 1. Completion Rate (30% weight)
    const totalTasks = tasksInRange.length;
    const completedTasks = tasksInRange.filter(t => t.status.toLowerCase() === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 2. Focus Time (25% weight)
    const totalFocusMinutes = focusSessions.reduce((sum, session) => {
        const sessionDate = new Date(session.date);
        if (sessionDate >= startDate) {
            return sum + (session.duration || 0);
        }
        return sum;
    }, 0);
    // Normalize: 0-300 minutes = 0-100 score (5 hours = max)
    const focusTimeScore = Math.min((totalFocusMinutes / 300) * 100, 100);

    // 3. Consistency (20% weight) - Days with activity / total days
    const activeDays = new Set<string>();
    tasksInRange.forEach(task => {
        if (task.created_at) {
            const dateStr = new Date(task.created_at).toISOString().split('T')[0];
            activeDays.add(dateStr);
            // Count done tasks as activity on creation date (approximation)
            if (task.status.toLowerCase() === 'done') {
                activeDays.add(dateStr);
            }
        }
    });
    focusSessions.forEach(session => {
        activeDays.add(new Date(session.date).toISOString().split('T')[0]);
    });
    const consistency = (activeDays.size / daysRange) * 100;

    // 4. Velocity (15% weight) - Tasks completed per day
    // Use created_at as approximation for completion date
    const completedInRange = tasksInRange.filter(t => {
        if (t.status.toLowerCase() !== 'done' || !t.created_at) return false;
        const created = new Date(t.created_at);
        return created >= startDate;
    });
    const velocity = (completedInRange.length / daysRange) * 10; // Normalize: 1 task/day = 10 points
    const velocityScore = Math.min(velocity * 10, 100);

    // 5. Quality (10% weight) - High priority tasks completion rate
    const highPriorityTasks = tasksInRange.filter(t => t.priority.toLowerCase() === 'high');
    const highPriorityCompleted = highPriorityTasks.filter(t => t.status.toLowerCase() === 'done').length;
    const quality = highPriorityTasks.length > 0 
        ? (highPriorityCompleted / highPriorityTasks.length) * 100 
        : 50; // Default 50 if no high priority tasks

    // Calculate weighted score
    const weights = {
        completion: 0.30,
        focus: 0.25,
        consistency: 0.20,
        velocity: 0.15,
        quality: 0.10,
    };

    const score = Math.round(
        completionRate * weights.completion +
        focusTimeScore * weights.focus +
        consistency * weights.consistency +
        velocityScore * weights.velocity +
        quality * weights.quality
    );

    return {
        score: Math.min(100, Math.max(0, score)),
        factors: {
            completionRate: Math.round(completionRate),
            focusTime: totalFocusMinutes,
            consistency: Math.round(consistency),
            velocity: Math.round(velocityScore),
            quality: Math.round(quality),
        },
        breakdown: {
            completionWeight: weights.completion * 100,
            focusWeight: weights.focus * 100,
            consistencyWeight: weights.consistency * 100,
            velocityWeight: weights.velocity * 100,
            qualityWeight: weights.quality * 100,
        },
    };
}

/**
 * Get Flow Score level and description
 */
export function getFlowScoreLevel(score: number): {
    level: 'excellent' | 'good' | 'average' | 'needs-improvement';
    label: string;
    color: string;
    description: string;
} {
    if (score >= 80) {
        return {
            level: 'excellent',
            label: 'Flow Master',
            color: 'text-emerald-400',
            description: 'You\'re in the zone! Maintain this momentum.',
        };
    } else if (score >= 60) {
        return {
            level: 'good',
            label: 'In Flow',
            color: 'text-indigo-400',
            description: 'Great progress! Keep up the good work.',
        };
    } else if (score >= 40) {
        return {
            level: 'average',
            label: 'Building Momentum',
            color: 'text-amber-400',
            description: 'You\'re on the right track. Focus on consistency.',
        };
    } else {
        return {
            level: 'needs-improvement',
            label: 'Getting Started',
            color: 'text-rose-400',
            description: 'Every journey begins with a single step. Start with small wins.',
        };
    }
}
