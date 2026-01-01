import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, ArrowLeft, Maximize2, Headphones, Volume2 } from "lucide-react";
import api from "../api/axios";
import type { Task } from "../api/tasks";
import "./FocusMode.css";
import { focusAudio, type SoundType } from "../utils/audioEngine";
import { useFocus } from "../context/FocusContext";

export default function FocusMode() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [audioActive, setAudioActive] = useState(false);
    const [soundType, setSoundType] = useState<SoundType>('brown');

    // Use global focus context
    const { isActive, timeLeft, startSession, pauseSession, resumeSession, resetSession } = useFocus();

    const toggleAudio = () => {
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

    const toggleTimer = () => {
        if (isActive) {
            pauseSession();
        } else {
            // If the timer was already running (not at 25:00), resume it
            if (timeLeft < 25 * 60) {
                resumeSession();
            } else {
                // Start a fresh session
                startSession(task?.title || "Deep Work Session", 25 * 60);
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

    if (loading) return <div className="focus-container">Loading...</div>;

    return (
        <div className="focus-container">
            {/* Ambient Background */}
            <div
                className="focus-bg-orb"
                style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', top: '10%', right: '20%' }}
            />
            <div
                className="focus-bg-orb"
                style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', bottom: '10%', left: '15%', animationDelay: '-5s' }}
            />

            <button onClick={() => navigate(-1)} className="focus-exit-btn">
                <ArrowLeft size={18} />
                Exit Focus
            </button>

            <div className="focus-content">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: '#ddd',
                        marginBottom: '1rem'
                    }}>
                        <Maximize2 size={12} />
                        <span>IMMERSIVE MODE</span>
                    </div>
                    <h2 className="focus-task-title">
                        {task?.title || "Deep Work Session"}
                    </h2>
                    {task?.description && (
                        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto' }}>
                            {task.description}
                        </p>
                    )}
                </div>

                <div className={`focus-timer-display ${isActive ? 'timer-active' : 'timer-paused'}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="focus-controls">
                    {/* Sound Selector */}
                    {audioActive && (
                        <div className="sound-selector animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <button
                                className={`sound-option ${soundType === 'brown' ? 'active' : ''}`}
                                onClick={() => handleSoundChange('brown')}
                            >
                                Deep
                            </button>
                            <button
                                className={`sound-option ${soundType === 'pink' ? 'active' : ''}`}
                                onClick={() => handleSoundChange('pink')}
                            >
                                Rain
                            </button>
                            <button
                                className={`sound-option ${soundType === 'white' ? 'active' : ''}`}
                                onClick={() => handleSoundChange('white')}
                            >
                                White
                            </button>
                        </div>
                    )}

                    <button
                        className={`btn-focus-secondary ${audioActive ? 'active-audio' : ''}`}
                        onClick={toggleAudio}
                        title="Toggle Focus Sound"
                    >
                        {audioActive ? <Volume2 size={20} /> : <Headphones size={20} />}
                    </button>

                    <button className="btn-focus-secondary" onClick={handleReset} title="Reset">
                        <RotateCcw size={20} />
                    </button>

                    <button className="btn-focus-primary" onClick={toggleTimer}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            <span>{isActive ? "Pause Focus" : "Start Focus"}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Breathing Animation Overlay */}
            {isActive && (
                <>
                    <div className="breathing-overlay" />
                    <div className="breathing-circle" />
                </>
            )}

            <p style={{ position: 'absolute', bottom: '2rem', opacity: 0.3, letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                "The secret of future is hidden in your daily routine."
            </p>
        </div>
    );
}
