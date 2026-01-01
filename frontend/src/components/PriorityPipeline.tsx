import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";

export default function PriorityPipeline() {
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
                        return 0; // fallback sort
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
        <div className="p-8 rounded-[1.5rem] border border-white/10 bg-zinc-900/50 shadow-xl backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-white tracking-wide font-outfit">Priority Pipeline</h3>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors tracking-wider uppercase flex items-center gap-1">
                    View All Tasks <ArrowRight size={12} />
                </button>
            </div>

            <div className="space-y-3 flex-1">
                {priorityTasks.length > 0 ? (
                    priorityTasks.map((task) => (
                        <div key={task.id} className="group p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-10 rounded-full ${getAccentColor(task.priority)} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                                <div>
                                    <h4 className="text-base font-medium text-zinc-200 group-hover:text-white transition-colors">{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                            {task.status}
                                        </span>
                                        <span className="text-zinc-600 text-[10px]">•</span>
                                        <span className="text-[10px] font-medium text-zinc-400">
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Due Date"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 opacity-50">
                        <p>No active tasks in pipeline.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
