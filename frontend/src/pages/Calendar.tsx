import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getTasksByRange, type Task } from "../api/tasks";
import { useTasks } from "../context/TaskContext";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { openCreateModal, openDetailsModal, refreshTrigger } = useTasks();

    // Get calendar days
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        // Add padding from previous month
        const startPadding = firstDay.getDay();
        for (let i = startPadding - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month, -i),
                currentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                currentMonth: true
            });
        }

        // Padding for next month to complete 6 rows
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false
            });
        }

        return days;
    }, [currentDate]);

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            const firstDate = daysInMonth[0].date.toISOString().split('T')[0];
            const lastDate = daysInMonth[daysInMonth.length - 1].date.toISOString().split('T')[0];

            try {
                const data = await getTasksByRange(firstDate, lastDate);
                setTasks(data);
            } catch (error) {
                console.error("Failed to fetch calendar tasks", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [daysInMonth, refreshTrigger]);

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const getTasksForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(t => t.due_date && t.due_date.split('T')[0] === dateStr);
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden bg-black flex-1">
            <header className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent font-[Outfit]">
                            {monthName} <span className="text-zinc-700">{year}</span>
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">Schedule & Vision</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={prevMonth}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-1.5 text-sm font-bold text-zinc-200 hover:text-white transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {/* Calendar Grid Container */}
            <div className="flex-1 bg-zinc-900/30 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col backdrop-blur-xl shadow-2xl">
                {/* Week Headers */}
                <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-x border-transparent">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6">
                    {daysInMonth.map((day, idx) => {
                        const dayTasks = getTasksForDate(day.date);
                        const isToday = new Date().toDateString() === day.date.toDateString();

                        return (
                            <div
                                key={idx}
                                onClick={() => openCreateModal(day.date.toISOString().split('T')[0])}
                                className={`group relative border-r border-b border-white/5 flex flex-col p-3 transition-all hover:bg-white/[0.02] cursor-pointer ${!day.currentMonth ? 'opacity-20 grayscale' : ''
                                    }`}
                            >
                                {/* Date Number */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold font-mono ${isToday
                                        ? 'w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-4 ring-indigo-500/20'
                                        : 'text-zinc-500 group-hover:text-zinc-300'
                                        }`}>
                                        {day.date.getDate()}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md font-bold">
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>

                                {/* Task Indicators */}
                                <div className="space-y-1 overflow-hidden relative z-10">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <div
                                            key={task.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDetailsModal(task);
                                            }}
                                            className={`text-[10px] px-2 py-1 rounded-lg truncate border flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 ${task.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                }`}
                                        >
                                            <div className={`h-1 w-1 rounded-full ${task.priority === 'high' ? 'bg-rose-500' :
                                                task.priority === 'medium' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                                }`} />
                                            {task.title}
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-[8px] text-zinc-600 font-bold px-2 uppercase tracking-tight">
                                            + {dayTasks.length - 3} more
                                        </div>
                                    )}
                                </div>

                                {isLoading && idx === 0 && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
