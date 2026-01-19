import { Layers, X } from 'lucide-react';
import type { GroupBy } from '../../types/filters';

interface GroupingSelectorProps {
    groupBy: GroupBy;
    onGroupByChange: (groupBy: GroupBy) => void;
}

export default function GroupingSelector({ groupBy, onGroupByChange }: GroupingSelectorProps) {
    const options: { value: GroupBy; label: string }[] = [
        { value: 'none', label: 'No Grouping' },
        { value: 'status', label: 'By Status' },
        { value: 'priority', label: 'By Priority' },
        { value: 'dueDate', label: 'By Due Date' },
    ];

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500">
                <Layers size={14} />
                <span className="font-bold uppercase tracking-wider">Group:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
                {options.map(option => (
                    <button
                        key={option.value}
                        onClick={() => onGroupByChange(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            groupBy === option.value
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-zinc-100 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-500 border border-zinc-300 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/10'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
                {groupBy !== 'none' && (
                    <button
                        onClick={() => onGroupByChange('none')}
                        className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Clear grouping"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        </div>
    );
}
