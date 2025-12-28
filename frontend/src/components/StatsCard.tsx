import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
    bg?: string;
    border?: string;
    shadow?: string;
    animation?: 'bounce' | 'pulse' | 'spin' | 'ping' | 'none';
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    color,
    bg = "from-zinc-800/50 to-zinc-900/50",
    border = "border-white/5",
    shadow = "shadow-lg",
    animation = 'none'
}: StatsCardProps) {
    const getAnimationClass = () => {
        switch (animation) {
            case 'bounce': return "group-hover:animate-bounce";
            case 'pulse': return "group-hover:animate-pulse";
            case 'spin': return "group-hover:animate-spin";
            case 'ping': return "group-hover:animate-ping";
            default: return "";
        }
    };

    return (
        <div className={`
            relative p-6 rounded-[1.5rem] 
            border ${border} 
            bg-gradient-to-br ${bg} 
            group hover:-translate-y-2 transition-all duration-500 ease-out
            overflow-hidden backdrop-blur-xl ${shadow} hover:shadow-2xl hover:shadow-indigo-500/10
            flex flex-col justify-between h-40
        `}>
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Background Icon Decoration */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rotate-12 pointer-events-none z-0">
                <Icon size={140} className={color} />
            </div>

            {/* Top Section: Icon */}
            <div className="relative z-10 w-full flex justify-between items-start">
                <div className={`
                    p-2.5 rounded-xl bg-white/5 ${color} 
                    ring-1 ring-white/10 shadow-sm 
                    group-hover:scale-110 transition-transform duration-300
                    backdrop-blur-md
                    ${getAnimationClass()}
                `}>
                    <Icon size={20} />
                </div>
            </div>

            {/* Bottom Section: Value and Title */}
            <div className="relative z-10 mt-auto flex flex-col gap-1">
                <div className="text-4xl font-bold text-white tracking-tight leading-none font-[Outfit] group-hover:translate-x-1 transition-transform duration-300">
                    {value}
                </div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors truncate pl-0.5 flex items-center gap-1">
                    {title}
                </div>
            </div>
        </div>
    );
}
