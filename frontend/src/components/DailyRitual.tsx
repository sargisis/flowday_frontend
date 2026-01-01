import { useState, useEffect } from "react";
import { type Task, updateTask, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { Sun, ArrowRight, CheckCircle } from "lucide-react";

export default function DailyRitual() {
    const { activeProjectId } = useProject();
    const [isOpen, setIsOpen] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [step, setStep] = useState(0); // 0: Intro, 1: Selection, 2: Ready
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Check if ritual was done today
        const lastRitual = localStorage.getItem(`daily_ritual_${new Date().toDateString()}`);
        if (!lastRitual) {
            // Delay slightly for effect
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (isOpen && activeProjectId) {
            getTasksByProject(activeProjectId).then(t => {
                // Filter tasks that are NOT done and NOT already in progress (maybe?)
                // For now just show all 'Todo' tasks
                setTasks(t.filter(task => task.status === 'Todo'));
            });
        }
    }, [isOpen, activeProjectId]);

    const handleToggleTask = (id: string) => {
        const newSet = new Set(selectedTaskIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedTaskIds(newSet);
    };

    const commitToDay = async () => {
        // Move selected tasks to 'In_Progress' (or a specific 'Today' status if we had one)
        // For now, let's just mark them as 'In_Progress'
        const promises = Array.from(selectedTaskIds).map(id =>
            updateTask(id, { status: "In_Progress" })
        );

        await Promise.all(promises);

        setStep(2);
        localStorage.setItem(`daily_ritual_${new Date().toDateString()}`, "true");

        setTimeout(() => {
            setIsOpen(false);
            window.location.reload(); // Refresh to show changes
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-700" />

            {/* Main Modal Card */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#0a0a0b]/80 backdrop-blur-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

                {/* Ambient Background Glows */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

                {/* Top decorative line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                <div className="relative p-10">
                    {step === 0 && (
                        <div className="text-center space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                {/* Sun Glow Effects */}
                                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                                <div className="relative w-full h-full bg-gradient-to-br from-orange-400/10 to-transparent rounded-full border border-orange-500/30 flex items-center justify-center">
                                    <Sun className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]" size={40} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight">
                                    Good Morning
                                </h2>
                                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                                    "The secret of your future is hidden in your daily routine."<br />
                                    <span className="text-zinc-600 text-sm mt-2 block">— Mike Murdock</span>
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 flex flex-col items-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="group relative w-3/4 py-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 text-black font-semibold rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />

                                    <div className="relative flex items-center justify-center gap-3">
                                        <span className="tracking-wide">Design Your Day</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-white transition-colors duration-300"
                                >
                                    Skip Sequence
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-light text-white">Focus Selection</h3>
                                <p className="text-zinc-500">Choose 1-3 tasks to conquer today.</p>
                            </div>

                            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-hide">
                                {tasks.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                                        <p className="text-zinc-500">Inbox Zero! 🎉</p>
                                        <p className="text-zinc-700 text-sm mt-1">Add tasks to your backlog first.</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleToggleTask(task.id)}
                                            className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-4
                                                ${selectedTaskIds.has(task.id)
                                                    ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)] translate-x-1'
                                                    : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-800/50 hover:translate-x-1'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-300
                                                ${selectedTaskIds.has(task.id)
                                                    ? 'bg-orange-500 border-orange-500 text-black'
                                                    : 'border-zinc-700 group-hover:border-zinc-500'
                                                }`}
                                            >
                                                {selectedTaskIds.has(task.id) && <CheckCircle size={14} strokeWidth={3} />}
                                            </div>
                                            <span className={`text-sm font-medium transition-colors duration-300 ${selectedTaskIds.has(task.id) ? 'text-white' : 'text-zinc-300'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={commitToDay}
                                disabled={selectedTaskIds.size === 0}
                                className={`group w-full py-4 font-bold tracking-wide rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden
                                    ${selectedTaskIds.size > 0
                                        ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-1'
                                        : 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                <span className="relative flex items-center gap-2">
                                    Commit {selectedTaskIds.size} Tasks
                                    {selectedTaskIds.size > 0 && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </button>

                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
                            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full" />
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-900/50">
                                    <CheckCircle size={40} className="animate-bounce-short" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-medium text-white">All Set</h2>
                                <p className="text-zinc-500">Your agenda is locked. Go deep.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
