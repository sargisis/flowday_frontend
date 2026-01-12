import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, AlertCircle, Clock } from "lucide-react";
import { type Task, getTasksByProject } from "../../api/tasks";
import { useProject } from "../../context/ProjectContext";
import { formatDistanceToNow, isPast, differenceInHours } from "date-fns";

export default function PriorityPipeline() {
    const navigate = useNavigate();
    const { activeProjectId } = useProject();
    const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then((fetchedTasks) => {
                // Filter and sort for high priority/upcoming
                // Logic: Not done + (High Priority OR Due Soon)
                const pipeline = fetchedTasks
                    .filter(t => t.status.toLowerCase() !== 'done')
                    .sort((a, b) => {
                        // Sort by priority (High > Medium > Low) then by due date
                        const priorityWeight: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
                        const pA = priorityWeight[a.priority.toLowerCase()] || 0;
                        const pB = priorityWeight[b.priority.toLowerCase()] || 0;
                        if (pA !== pB) return pB - pA;
                        
                        // If same priority, sort by due date (earlier first)
                        if (a.due_date && b.due_date) {
                            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                        }
                        if (a.due_date && !b.due_date) return -1;
                        if (!a.due_date && b.due_date) return 1;
                        return 0;
                    })
                    .slice(0, 4); // Top 4
                setPriorityTasks(pipeline);
            });
        }
    }, [activeProjectId]);

    const getPriorityColor = (p: string) => {
        switch (p.toLowerCase()) {
            case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    const getAccentColor = (p: string) => {
        switch (p.toLowerCase()) {
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-blue-500';
            default: return 'bg-zinc-500';
        }
    }

    return (
        <div className="p-6 h-[450px] rounded-[1.5rem] border border-white/10 bg-zinc-900/50 shadow-xl backdrop-blur-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white tracking-wide font-outfit">Priority Pipeline</h3>
                <button
                    onClick={() => navigate('/app/v1/tasks')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors tracking-wider uppercase flex items-center gap-1"
                >
                    View All Tasks <ArrowRight size={12} />
                </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 fade-bottom">
                {priorityTasks.length > 0 ? (
                    priorityTasks.map((task) => {
                        const dueDate = task.due_date ? new Date(task.due_date) : null;
                        const isOverdue = dueDate && isPast(dueDate) && task.status.toLowerCase() !== 'done';
                        const hoursUntilDue = dueDate ? differenceInHours(dueDate, new Date()) : null;
                        const isDueSoon = hoursUntilDue !== null && hoursUntilDue > 0 && hoursUntilDue <= 24;

                        return (
                            <div key={task.id} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 flex items-center justify-between cursor-pointer" onClick={() => navigate(`/app/v1/tasks`)}>
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-1 h-10 rounded-full ${getAccentColor(task.priority)} opacity-40 flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-medium text-zinc-300 group-hover:text-white transition-colors tracking-tight truncate">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            {task.due_date && (
                                                <>
                                                    <span className="text-zinc-700 text-xs">•</span>
                                                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-400' : isDueSoon ? 'text-orange-400' : 'text-zinc-500'}`}>
                                                        <Calendar size={11} className={isOverdue ? 'text-rose-400' : isDueSoon ? 'text-orange-400' : 'text-zinc-600'} />
                                                        <span className="text-xs font-medium">
                                                            {isOverdue ? (
                                                                <span className="flex items-center gap-1">
                                                                    <AlertCircle size={11} className="text-rose-400" />
                                                                    Overdue
                                                                </span>
                                                            ) : isDueSoon && dueDate ? (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={11} className="text-orange-400" />
                                                                    {formatDistanceToNow(dueDate, { addSuffix: true })}
                                                                </span>
                                                            ) : dueDate ? (
                                                                formatDistanceToNow(dueDate, { addSuffix: true })
                                                            ) : null}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)} opacity-90 flex-shrink-0 ml-3`}>
                                    {task.priority}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 opacity-50">
                        <p>No active tasks in pipeline.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
