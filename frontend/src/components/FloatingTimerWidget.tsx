import { useNavigate } from "react-router-dom";
import { useFocus } from "../context/FocusContext";
import { Play, Pause, X } from "lucide-react";

export default function FloatingTimerWidget() {
    const navigate = useNavigate();
    const { isActive, timeLeft, taskTitle, pauseSession, resumeSession, resetSession } = useFocus();

    // Don't show if no session
    if (timeLeft === 25 * 60 && !isActive) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleClick = () => {
        navigate('/app/v1/focus');
    };

    const handleTogglePause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActive) {
            pauseSession();
        } else {
            resumeSession();
        }
    };

    const handleStop = (e: React.MouseEvent) => {
        e.stopPropagation();
        resetSession();
    };

    return (
        <div className="fixed bottom-6 right-8 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div
                onClick={handleClick}
                className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-500/30 cursor-pointer hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105"
            >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>

                {/* Content */}
                <div className="relative flex items-center gap-4 px-6 py-4 min-w-[320px]">
                    {/* Pulsing indicator */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTogglePause}
                            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
                        >
                            {isActive ? (
                                <>
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                    <Pause size={18} className="text-white relative z-10" fill="currentColor" />
                                </>
                            ) : (
                                <Play size={18} className="text-white relative z-10 pl-1" fill="currentColor" />
                            )}
                        </button>

                        <div>
                            <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                {isActive ? 'Deep Work' : 'Paused'}
                            </div>
                            <div className="text-sm font-semibold text-white truncate max-w-[140px]">
                                {taskTitle || 'Focus Session'}
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="ml-auto flex items-center gap-3">
                        <div className="text-2xl font-bold text-white font-mono tabular-nums">
                            {formatTime(timeLeft)}
                        </div>

                        {/* Stop button */}
                        <button
                            onClick={handleStop}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            title="Stop session"
                        >
                            <X size={16} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
