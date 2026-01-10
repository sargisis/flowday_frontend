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
            relative p-4 rounded-xl 
            border ${border} 
            bg-gradient-to-br ${bg} 
            group hover:-translate-y-1 transition-all duration-300 ease-out
            overflow-hidden backdrop-blur-xl ${shadow} hover:shadow-xl
            flex flex-col justify-between h-32
        `}>
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Background Icon Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 rotate-12 pointer-events-none z-0">
                <Icon size={100} className={color} />
            </div>

            {/* Top Section: Icon */}
            <div className="relative z-10 w-full flex justify-between items-start">
                <div className={`
                    p-2 rounded-lg bg-white/5 ${color} 
                    ring-1 ring-white/10 shadow-sm 
                    group-hover:scale-110 transition-transform duration-300
                    backdrop-blur-md
                    ${getAnimationClass()}
                `}>
                    <Icon size={16} />
                </div>
            </div>

            {/* Bottom Section: Value and Title */}
            <div className="relative z-10 mt-auto flex flex-col gap-1">
                <div className="text-3xl font-bold text-white tracking-tight leading-none font-[Outfit]">
                    {value}
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                    {title}
                </div>
            </div>
        </div>
    );
}
