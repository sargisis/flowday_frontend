import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, ArrowLeft, Maximize2, Headphones, Volume2, X } from "lucide-react";
import { updateUserStatus } from "../api/auth";
import api from "../api/axios";
import type { Task } from "../api/tasks";
// Removed FocusMode.css import
import { focusAudio, type SoundType } from "../utils/audioEngine";
import { useFocus } from "../context/FocusContext";

export default function FocusMode() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [audioActive, setAudioActive] = useState(false);
    const [soundType, setSoundType] = useState<SoundType>('brown');
    const [showSoundMenu, setShowSoundMenu] = useState(false);

    // Use global focus context
    const { isActive, timeLeft, startSession, pauseSession, resumeSession, resetSession } = useFocus();

    const toggleAudio = () => {
        if (!audioActive) {
            setShowSoundMenu(true);
        }
        const isNowPlaying = focusAudio.toggle(soundType);
        setAudioActive(isNowPlaying);
    };

    const handleSoundChange = (type: SoundType) => {
        setSoundType(type);
        if (audioActive) {
            focusAudio.play(type);
        } else {
            focusAudio.play(type);
            setAudioActive(true);
        }
    };

    // Stop audio when unmounting
    useEffect(() => {
        return () => {
            focusAudio.stop();
        };
    }, []);

    useEffect(() => {
        async function fetchTask() {
            try {
                if (!taskId) return;
                const res = await api.get(`/tasks/ids/${taskId}`);
                setTask(res.data);
            } catch (err) {
                console.error("Failed to fetch task", err);
            } finally {
                setLoading(false);
            }
        }
        if (taskId) {
            fetchTask();
        } else {
            setLoading(false);
        }
    }, [taskId]);

    const toggleTimer = async () => {
        if (isActive) {
            pauseSession();
            await updateUserStatus("Online");
        } else {
            // If the timer was already running (not at 25:00), resume it
            if (timeLeft < 25 * 60) {
                resumeSession();
                await updateUserStatus("Deep Work");
            } else {
                // Start a fresh session
                startSession(task?.title || "Deep Work Session", 25 * 60);
                await updateUserStatus("Deep Work");
            }
        }
    };

    const handleReset = () => {
        resetSession();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div className="text-center space-y-4 animate-pulse">
                <div className="h-12 w-64 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg mx-auto bg-[length:200%_100%] animate-shimmer"></div>
                <div className="h-32 w-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full mx-auto bg-[length:200%_100%] animate-shimmer"></div>
                <div className="h-6 w-48 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded mx-auto bg-[length:200%_100%] animate-shimmer"></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-black to-black pointer-events-none" />

            {/* Animated Orbs */}
            <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none mix-blend-screen" />
            <div className={`absolute bottom-[10%] left-[15%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen duration-[5s] transition-all ${isActive ? 'animate-pulse scale-110' : 'scale-100'}`} />

            {/* Breathing Animation Overlay */}
            {isActive && (
                <div className="absolute inset-0 pointer-events-none animate-[pulse_4s_ease-in-out_infinite]">
                    <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
                </div>
            )}

            {/* DND Badge */}
            {isActive && (
                <div className="absolute top-8 right-8 flex items-center gap-3 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>Do Not Disturb</span>
                </div>
            )}

            {/* Exit Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-sm font-medium tracking-wide group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Exit Focus
            </button>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
                {/* Header */}
                <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                        <Maximize2 size={10} />
                        <span>Immersive Mode</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                        {task?.title || "Deep Work Session"}
                    </h2>

                    {task?.description && (
                        <p className="text-zinc-500 max-w-lg mx-auto text-lg leading-relaxed">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Timer */}
                <div className={`relative mb-16 transition-all duration-700 ${isActive ? 'scale-105 drop-shadow-[0_0_50px_rgba(139,92,246,0.3)]' : 'opacity-80'}`}>
                    <div className="text-[8rem] md:text-[12rem] leading-none font-thin font-outfit tracking-tighter tabular-nums select-none">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100">

                    {/* Sound Menu */}
                    {audioActive && showSoundMenu && (
                        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl animate-in zoom-in-95 duration-300 mb-2">
                            {(['deep_focus', 'brown', 'pink', 'white'] as SoundType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleSoundChange(type)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${soundType === type
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowSoundMenu(false)}
                                className="p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 ml-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        {/* Audio Toggle */}
                        <button
                            onClick={toggleAudio}
                            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 ${audioActive
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10'
                                }`}
                            title="Focus Sound"
                        >
                            {audioActive ? <Volume2 size={24} className="animate-pulse" /> : <Headphones size={24} />}
                        </button>

                        {/* Play/Pause Button */}
                        <button
                            onClick={toggleTimer}
                            className="group relative flex items-center justify-center gap-3 px-12 py-5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_10px_60px_-10px_rgba(124,58,237,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
                        >
                            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                            <span className="text-xl font-bold tracking-wide">
                                {isActive ? "PAUSE FRAME" : "ENTER FOCUS"}
                            </span>
                        </button>

                        {/* Reset Button */}
                        <button
                            onClick={handleReset}
                            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 hover:rotate-180 transition-all duration-500"
                            title="Reset Timer"
                        >
                            <RotateCcw size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Quote */}
            <div className="absolute bottom-8 text-center w-full px-4 opacity-30 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <p className="text-xs uppercase tracking-[0.3em] font-medium text-zinc-400">
                    "The secret of future is hidden in your daily routine."
                </p>
            </div>
        </div>
    );
}
