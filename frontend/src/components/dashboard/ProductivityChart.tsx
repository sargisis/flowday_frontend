import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

interface ProductivityData {
    date: string;
    completed: number;
    efficiency: number;
}

interface ProductivityChartProps {
    data: ProductivityData[];
    isLoading?: boolean;
}

export default function ProductivityChart({ data, isLoading }: ProductivityChartProps) {
    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-[1.5rem] animate-pulse">
                <div className="flex flex-col items-center gap-2">
                    <Activity className="h-8 w-8 text-zinc-700 animate-spin" />
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Analyzing Flow...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="col-span-1 lg:col-span-2 p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-xl shadow-black/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider leading-none">Productivity Velocity</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Throughput & Efficiency Analysis</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span>Efficiency %</span>
                    </div>
                </div>
            </div>

            <div className="h-[260px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.length > 0 ? data : []}>
                        <defs>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b881" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b881" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            hide
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#09090b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#71717a', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            animationDuration={2000}
                        />
                        <Area
                            type="monotone"
                            dataKey="efficiency"
                            stroke="#10b881"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorEff)"
                            animationDuration={2500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
