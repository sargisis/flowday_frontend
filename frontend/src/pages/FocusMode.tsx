import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, ArrowLeft, Maximize2, Headphones, Volume2 } from "lucide-react";
import api from "../api/axios";
import type { Task } from "../api/tasks";
import "./FocusMode.css";
import { focusAudio } from "../utils/audioEngine";

export default function FocusMode() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [audioActive, setAudioActive] = useState(false);

    const toggleAudio = () => {
        const isNowPlaying = focusAudio.toggle();
        setAudioActive(isNowPlaying);
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

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play a sound here
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
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
                    <button
                        className={`btn-focus-secondary ${audioActive ? 'active-audio' : ''}`}
                        onClick={toggleAudio}
                        title="Focus Sound (Brown Noise)"
                    >
                        {audioActive ? <Volume2 size={20} /> : <Headphones size={20} />}
                    </button>

                    <button className="btn-focus-secondary" onClick={resetTimer} title="Reset">
                        <RotateCcw size={20} />
                    </button>

                    <button className="btn-focus-primary" onClick={toggleTimer}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            <span>{isActive ? "Pause Focus" : "Start Focus"}</span>
                        </div>
                    </button>

                    {/* Placeholder for future specific focus blockers or music controls */}
                </div>
            </div>

            <p style={{ position: 'absolute', bottom: '2rem', opacity: 0.3, letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                "The secret of future is hidden in your daily routine."
            </p>
        </div>
    );
}
