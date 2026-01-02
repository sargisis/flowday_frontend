import { Zap, Trophy, Lightbulb, AlertTriangle, ArrowRight, Target, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type Task, getAIHealthAdvice } from "../../api/tasks";
import { useMemo, useState, useEffect } from "react";

interface AiFlowCoachProps {
    tasks: Task[];
}

interface Insight {
    id: string;
    icon: any;
    iconColor: string;
    title: string;
    message: string;
    variant: 'positive' | 'neutral' | 'warning' | 'ai';
}

export default function AiFlowCoach({ tasks }: AiFlowCoachProps) {
    const navigate = useNavigate();
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const fetchAdvice = async () => {
            if (tasks.length === 0) return;
            setIsThinking(true);
            try {
                // Calculate detailed statistics for "Background Analysis"
                const now = new Date();
                const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

                // Identify stale tasks (In Progress for > 3 days)
                const staleTasks = tasks
                    .filter(t => t.status.toLowerCase() === 'in_progress' && t.created_at && new Date(t.created_at) < threeDaysAgo)
                    .map(t => t.title);

                // Identify blockers
                const blockedTasks = tasks
                    .filter(t => t.status.toLowerCase() === 'blocked')
                    .map(t => t.title);

                // Calculate simple weekly velocity (approximated by 'done' tasks created in last 7 days for MVP)
                // Real velocity would need a 'completed_at' field, assume 'created_at' approximates activity for now or just use total done count
                const doneCount = tasks.filter(t => t.status.toLowerCase() === 'done').length;

                const stats = {
                    todo: tasks.filter(t => t.status.toLowerCase() === 'todo').length,
                    in_progress: tasks.filter(t => t.status.toLowerCase() === 'in_progress').length,
                    blocked: blockedTasks.length,
                    done: doneCount,
                    high_priority: tasks.filter(t => t.priority.toLowerCase() === 'high').length,
                };

                const overdueCount = tasks.filter(t => {
                    if (!t.due_date) return false;
                    return new Date(t.due_date) < now && t.status.toLowerCase() !== 'done';
                }).length;

                const res = await getAIHealthAdvice({
                    stats,
                    stale_tasks: staleTasks,
                    blocked_tasks: blockedTasks,
                    velocity: doneCount, // Using total done as proxy for now
                    overdue_count: overdueCount
                });

                setAiAdvice(res.advice);
            } catch (err) {
                console.error("Failed to fetch AI advice", err);
            } finally {
                setIsThinking(false);
            }
        };

        // Debounce to prevent too many API calls
        const timer = setTimeout(fetchAdvice, 1000);
        return () => clearTimeout(timer);
    }, [tasks]);

    const insights = useMemo<Insight[]>(() => {
        const results: Insight[] = [];

        // Add AI advice if available
        if (aiAdvice) {
            results.push({
                id: 'ai-advice',
                icon: Sparkles,
                iconColor: 'text-indigo-400',
                title: 'Flow Intelligence',
                message: aiAdvice,
                variant: 'ai'
            });
        }

        // Count tasks by status
        const inProgressTasks = tasks.filter(t => {
            const s = t.status.toLowerCase();
            return ['in_progress', 'review'].includes(s);
        });
        const todoTasks = tasks.filter(t => t.status.toLowerCase() === 'todo');
        const doneTasks = tasks.filter(t => t.status.toLowerCase() === 'done');
        const blockedTasks = tasks.filter(t => t.status.toLowerCase() === 'blocked');

        // Count high priority tasks in Todo
        const highPriorityTodo = todoTasks.filter(t => t.priority.toLowerCase() === 'high');

        // Calculate completion rate
        const total = tasks.length;
        const completionRate = total > 0 ? (doneTasks.length / total) * 100 : 0;

        // Check for overdue tasks
        const now = new Date();
        const overdueTasks = tasks.filter(t => {
            if (!t.due_date) return false;
            const dueDate = new Date(t.due_date);
            return dueDate < now && t.status.toLowerCase() !== 'done';
        });

        // HEURISTIC 1: Too many WIP
        if (inProgressTasks.length > 3) {
            results.push({
                id: 'too-many-wip',
                icon: AlertTriangle,
                iconColor: 'text-orange-400',
                title: 'Stop Starting, Start Finishing',
                message: `You have ${inProgressTasks.length} tasks in progress. Focus on completing a few before starting new ones.`,
                variant: 'warning'
            });
        }

        // HEURISTIC 2: High priority waiting
        if (highPriorityTodo.length > 0) {
            results.push({
                id: 'high-priority-waiting',
                icon: Target,
                iconColor: 'text-rose-400',
                title: 'High Priority Task Waiting',
                message: `${highPriorityTodo.length} high-priority ${highPriorityTodo.length === 1 ? 'task' : 'tasks'} in To Do. Consider tackling ${highPriorityTodo.length === 1 ? 'it' : 'them'} first for maximum impact.`,
                variant: 'warning'
            });
        }

        // HEURISTIC 3: Great momentum
        if (completionRate >= 70 && total >= 5) {
            results.push({
                id: 'great-momentum',
                icon: Trophy,
                iconColor: 'text-amber-400',
                title: 'Excellent Progress!',
                message: `You've completed ${Math.round(completionRate)}% of tasks. Keep this momentum going to finish strong!`,
                variant: 'positive'
            });
        }

        // HEURISTIC 4: Overdue alert
        if (overdueTasks.length > 0) {
            results.push({
                id: 'overdue-alert',
                icon: AlertTriangle,
                iconColor: 'text-red-400',
                title: 'Overdue Tasks Detected',
                message: `${overdueTasks.length} ${overdueTasks.length === 1 ? 'task is' : 'tasks are'} past their due date. Prioritize or reschedule them.`,
                variant: 'warning'
            });
        }

        // HEURISTIC 5: Blocked tasks
        if (blockedTasks.length > 0) {
            results.push({
                id: 'blocked-tasks',
                icon: AlertTriangle,
                iconColor: 'text-orange-400',
                title: 'Blocked Tasks Need Attention',
                message: `${blockedTasks.length} ${blockedTasks.length === 1 ? 'task is' : 'tasks are'} blocked. Address blockers to maintain flow.`,
                variant: 'warning'
            });
        }

        // HEURISTIC 6: Low WIP = Good
        if (inProgressTasks.length <= 2 && inProgressTasks.length > 0) {
            results.push({
                id: 'good-focus',
                icon: Lightbulb,
                iconColor: 'text-blue-400',
                title: 'Single-Tasking Champion',
                message: 'You\'re maintaining a healthy WIP limit. This focus will maximize your productivity.',
                variant: 'positive'
            });
        }

        // HEURISTIC 7: Steady progress
        if (completionRate >= 40 && completionRate < 70 && total >= 5) {
            results.push({
                id: 'steady-progress',
                icon: TrendingUp,
                iconColor: 'text-emerald-400',
                title: 'Making Steady Progress',
                message: `${Math.round(completionRate)}% complete. You're on track. Keep the rhythm going!`,
                variant: 'neutral'
            });
        }

        // Default insight if no data
        if (results.length === 0) {
            results.push({
                id: 'get-started',
                icon: Lightbulb,
                iconColor: 'text-blue-400',
                title: 'Ready to Achieve Flow',
                message: 'Add tasks to your board and I\'ll provide personalized insights to help you stay productive.',
                variant: 'neutral'
            });
        }

        // Return max 3 insights
        return results.slice(0, 3);
    }, [tasks]);

    const getBorderClass = (variant: Insight['variant']) => {
        switch (variant) {
            case 'positive':
                return 'bg-emerald-500/[0.05] border-emerald-500/10 hover:border-emerald-500/20';
            case 'warning':
                return 'bg-orange-500/[0.05] border-orange-500/10 hover:border-orange-500/20';
            case 'ai':
                return 'bg-indigo-500/[0.08] border-indigo-500/20 hover:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]';
            default:
                return 'bg-white/[0.03] border-white/5 hover:border-white/10';
        }
    };

    return (
        <div className="p-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-indigo-950/30 to-background shadow-xl backdrop-blur-xl relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 p-12 opacity-5 bg-indigo-500 blur-3xl rounded-full translate-x-10 translate-y-[-50%]" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Zap size={20} className="fill-indigo-500/20" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white tracking-wide font-outfit">AI Flow Coach</h3>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} Analyzed
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="space-y-4 relative z-10">
                {isThinking && !aiAdvice && (
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] animate-pulse flex gap-4">
                        <div className="mt-1">
                            <Sparkles size={18} className="text-indigo-400 animate-spin" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-indigo-500/20 rounded w-1/3" />
                            <div className="h-3 bg-indigo-500/10 rounded w-full" />
                        </div>
                    </div>
                )}
                {insights.map(insight => {
                    const Icon = insight.icon;
                    return (
                        <div
                            key={insight.id}
                            className={`p-4 rounded-xl border transition-colors flex gap-4 group/item ${getBorderClass(insight.variant)}`}
                        >
                            <div className="mt-1">
                                <Icon size={18} className={insight.iconColor} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-200 mb-1">{insight.title}</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed group-hover/item:text-zinc-300 transition-colors">
                                    {insight.message}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Button */}
            <button
                onClick={() => navigate('/app/v1/focus')}
                className="w-full mt-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group/btn relative z-10"
            >
                Start Focus Session
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
