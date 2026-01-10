import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, CheckCircle2, Clock, Zap } from "lucide-react";
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

    // Calculate statistics
    const stats = useMemo(() => {
        const currentMonthTasks = tasks.filter(t => {
            if (!t.due_date) return false;
            const taskDate = new Date(t.due_date);
            return taskDate.getMonth() === currentDate.getMonth() &&
                taskDate.getFullYear() === currentDate.getFullYear();
        });

        const completed = currentMonthTasks.filter(t => t.status === 'done').length;
        const total = currentMonthTasks.length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Upcoming deadlines (next 7 days from today)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = tasks.filter(t => {
            if (!t.due_date || t.status === 'done') return false;
            const taskDate = new Date(t.due_date);
            return taskDate >= today && taskDate <= nextWeek;
        }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

        return { total, completed, pending, completionRate, upcoming };
    }, [tasks, currentDate]);

    return (
        <div className="h-full flex p-4 lg:p-6 gap-4 overflow-hidden bg-black animate-in fade-in duration-700">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Compact Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                {monthName} <span className="text-zinc-500">{year}</span>
                            </h1>
                            <p className="text-xs text-zinc-500 mt-0.5">{stats.total} tasks this month</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-lg border border-white/10">
                        <button
                            onClick={prevMonth}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-4 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Today
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </header>

                {/* Calendar Grid Container */}
                <div className="flex-1 bg-zinc-900/30 border border-white/10 rounded-xl overflow-hidden flex flex-col backdrop-blur-xl">
                    {/* Week Headers */}
                    <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
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
                                    className={`group relative border-r border-b border-white/5 flex flex-col p-2 transition-all hover:bg-white/[0.02] cursor-pointer ${!day.currentMonth ? 'opacity-20 grayscale' : ''
                                        }`}
                                >
                                    {/* Date Number */}
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className={`text-xs font-bold font-mono ${isToday
                                                ? 'w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]'
                                                : 'text-zinc-500 group-hover:text-zinc-300'
                                            }`}>
                                            {day.date.getDate()}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">
                                                {dayTasks.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Task Indicators */}
                                    <div className="space-y-0.5 overflow-hidden relative z-10">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div
                                                key={task.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDetailsModal(task);
                                                }}
                                                className={`text-[9px] px-1.5 py-0.5 rounded truncate border flex items-center gap-1 transition-all hover:scale-[1.02] ${task.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
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
                                            <div className="text-[8px] text-zinc-600 font-bold px-1.5 uppercase">
                                                +{dayTasks.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    {isLoading && idx === 0 && (
                                        <div className="absolute top-1 right-1">
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-500 border-t-transparent" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stats Sidebar */}
            <div className="w-64 flex flex-col gap-4 shrink-0">
                {/* Month Stats */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Month Stats</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-500">Completion Rate</span>
                            <span className="text-lg font-bold text-indigo-400">{stats.completionRate}%</span>
                        </div>

                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-500"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Done</span>
                                </div>
                                <p className="text-lg font-bold text-emerald-400">{stats.completed}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Clock size={12} className="text-amber-400" />
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Pending</span>
                                </div>
                                <p className="text-lg font-bold text-amber-400">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="flex-1 p-4 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-amber-400" />
                        <h3 className="text-sm font-bold text-white">Next 7 Days</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {stats.upcoming.length === 0 ? (
                            <p className="text-xs text-zinc-600 text-center py-8">No upcoming deadlines</p>
                        ) : (
                            stats.upcoming.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => openDetailsModal(task)}
                                    className="p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-xs text-white font-medium truncate group-hover:text-indigo-400 transition-colors">
                                            {task.title}
                                        </p>
                                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${task.priority === 'high' ? 'bg-rose-500' :
                                                task.priority === 'medium' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                            }`} />
                                    </div>
                                    <p className="text-[10px] text-zinc-500">
                                        {new Date(task.due_date!).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
