import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getFlowScoreLevel } from '../../utils/flowScore';
import { ProgressBar } from '../ui/ProgressBar';

interface FlowScoreCardProps {
    score: number;
    previousScore?: number;
    factors: {
        completionRate: number;
        focusTime: number;
        consistency: number;
        velocity: number;
        quality: number;
    };
}

export function FlowScoreCard({ score, previousScore, factors }: FlowScoreCardProps) {
    const level = getFlowScoreLevel(score);
    const trend = previousScore !== undefined 
        ? score > previousScore ? 'up' : score < previousScore ? 'down' : 'same'
        : null;
    const trendValue = previousScore !== undefined ? Math.abs(score - previousScore) : 0;

    return (
        <div className="bg-zinc-900/40 border-2 border-white/5 rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Flow Score
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className={`text-4xl font-bold ${level.color}`}>
                            {score}
                        </span>
                        <span className="text-lg text-zinc-500">/ 100</span>
                        {trend && (
                            <div className={`flex items-center gap-1 text-sm ${
                                trend === 'up' ? 'text-emerald-400' : 
                                trend === 'down' ? 'text-rose-400' : 
                                'text-zinc-500'
                            }`}>
                                {trend === 'up' && <TrendingUp size={16} />}
                                {trend === 'down' && <TrendingDown size={16} />}
                                {trend === 'same' && <Minus size={16} />}
                                {trendValue > 0 && <span>{trendValue}</span>}
                            </div>
                        )}
                    </div>
                    <p className={`text-sm font-semibold mt-2 ${level.color}`}>
                        {level.label}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                        {level.description}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar 
                progress={score} 
                showPercentage={false}
                className="h-3"
            />

            {/* Factors Breakdown */}
            <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Score Breakdown
                </h4>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Completion Rate</span>
                            <span className="text-zinc-300 font-semibold">{factors.completionRate}%</span>
                        </div>
                        <ProgressBar progress={factors.completionRate} showPercentage={false} className="h-1.5" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Focus Time</span>
                            <span className="text-zinc-300 font-semibold">{Math.round(factors.focusTime)} min</span>
                        </div>
                        <ProgressBar progress={Math.min((factors.focusTime / 300) * 100, 100)} showPercentage={false} className="h-1.5" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Consistency</span>
                            <span className="text-zinc-300 font-semibold">{factors.consistency}%</span>
                        </div>
                        <ProgressBar progress={factors.consistency} showPercentage={false} className="h-1.5" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Velocity</span>
                            <span className="text-zinc-300 font-semibold">{factors.velocity}%</span>
                        </div>
                        <ProgressBar progress={factors.velocity} showPercentage={false} className="h-1.5" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Quality</span>
                            <span className="text-zinc-300 font-semibold">{factors.quality}%</span>
                        </div>
                        <ProgressBar progress={factors.quality} showPercentage={false} className="h-1.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
