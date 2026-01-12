import { TrendingUp } from "lucide-react";

interface FocusData {
    day: string;
    percent: number;
}

interface FocusTrendCardProps {
    data: FocusData[];
}

export default function FocusTrendCard({ data }: FocusTrendCardProps) {
    return (
        <div className="col-span-1 p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:animate-pulse">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Focus Analytics</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">7-Day Trend</p>
                </div>
            </div>

            <div className="h-28 flex items-end gap-2 px-1 relative z-10">
                {data.map((d, i) => {
                    const height = Math.max(d.percent || 8, 8); // Minimum 8% for visibility
                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end group/bar h-full relative">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none z-20">
                                <div className="bg-zinc-800/95 border border-white/10 rounded-lg px-2 py-1 shadow-xl backdrop-blur-sm whitespace-nowrap">
                                    <span className="text-xs font-semibold text-white">{d.percent}%</span>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-800/95 border-r border-b border-white/10 rotate-45" />
                                </div>
                            </div>
                            <div
                                className="w-full bg-gradient-to-t from-purple-600/30 to-purple-500/20 rounded-t-sm group-hover/bar:from-purple-500/50 group-hover/bar:to-purple-400/40 border-t border-x border-purple-500/20 group-hover/bar:border-purple-400/40 transition-all duration-300 cursor-pointer"
                                style={{ height: `${height}%` }}
                                title={`${d.percent}% completion on ${d.day}`}
                            />
                            <span className="text-xs text-zinc-500 text-center mt-2 uppercase font-medium">{d.day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
