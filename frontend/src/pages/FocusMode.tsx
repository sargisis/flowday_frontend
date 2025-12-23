import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Task } from "../api/tasks";

export default function FocusMode() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTask() {
            try {
                // Ideally this should be api.get(\`/tasks/\${taskId}\`)
                // We default to a catch-all for now if endpoint varies
                const res = await api.get(`/tasks/${taskId}`);
                setTask(res.data);
            } catch (err) {
                console.error("Failed to fetch task", err);
            } finally {
                setLoading(false);
            }
        }
        if (taskId) {
            fetchTask();
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
        return `${mins.toString().padStart(2, "0")}: ${secs.toString().padStart(2, "0")}`;
    };

    if (loading) return <div className="p-8 text-center text-white">Loading Focus Mode...</div>;

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            background: "#0f0f13",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    position: "absolute",
                    top: "2rem",
                    left: "2rem",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    fontSize: "1rem"
                }}
            >
                ← Exit Focus
            </button>

            <div style={{ textAlign: "center", maxWidth: "600px", padding: "2rem" }}>
                <h2 style={{
                    fontSize: "2.5rem",
                    marginBottom: "1rem",
                    background: "linear-gradient(90deg, #a78bfa, #f472b6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    {task?.title || "Deep Work Session"}
                </h2>

                <div style={{
                    fontSize: "8rem",
                    fontWeight: "bold",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    margin: "2rem 0",
                    textShadow: "0 0 40px rgba(167, 139, 250, 0.3)"
                }}>
                    {formatTime(timeLeft)}
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button
                        onClick={toggleTimer}
                        style={{
                            padding: "1rem 3rem",
                            fontSize: "1.2rem",
                            borderRadius: "99px",
                            border: "none",
                            background: isActive ? "rgba(255,255,255,0.1)" : "#8b5cf6",
                            color: "#fff",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        {isActive ? "Pause" : "Start Focus"}
                    </button>

                    <button
                        onClick={resetTimer}
                        style={{
                            padding: "1rem",
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "transparent",
                            color: "rgba(255,255,255,0.5)",
                            cursor: "pointer",
                            width: "3.5rem",
                            height: "3.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        title="Reset Timer"
                    >
                        ↻
                    </button>
                </div>
            </div>

            <p style={{
                position: "absolute",
                bottom: "2rem",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.9rem"
            }}>
                Flowday Zen Mode
            </p>
        </div>
    );
}
