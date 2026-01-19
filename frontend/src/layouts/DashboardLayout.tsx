import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import TacticalOverlay from "../components/TacticalOverlay";
import FloatingTimerWidget from "../components/FloatingTimerWidget";
import NotificationPermissionBanner from "../components/notification/NotificationPermissionBanner";
import CommandPalette from "../components/command-palette/CommandPalette";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { useTasks } from "../context/TaskContext";
import { useUser } from "../context/UserContext";
// Dynamic import for confetti (heavy library, only loaded when needed)
const loadConfetti = () => import("canvas-confetti").then(m => m.default);
import FlowBotWidget from "../components/ai/FlowBotWidget";
import CreateTaskModal from "../components/create-task-components/CreateTaskModal";
import TaskDetailsModal from "../components/task-components/TaskDetailsModal";
import { OfflineBanner } from "../components/error/OfflineBanner";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const {
        openCreateModal,
        isCreateModalOpen,
        closeCreateModal,
        handleCreateTask,
        initialDate,
        selectedTask,
        closeDetailsModal,
        handleUpdateTask,
        handleDeleteTask
    } = useTasks();
    const { user } = useUser();
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const prevLevelRef = useRef<number | undefined>(undefined);

    // Level-Up Celebration Logic
    useEffect(() => {
        if (user && prevLevelRef.current !== undefined && (user.level || 0) > prevLevelRef.current) {
            // Level increased! Load and fire confetti
            loadConfetti().then(confetti => {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#a855f7', '#ec4899']
                });
            });

            // Optional: Play a sound if available
        }
        if (user) {
            prevLevelRef.current = user.level || 0;
        }
    }, [user?.level]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.metaKey || e.ctrlKey;
            const isAlt = e.altKey;

            // Don't trigger shortcuts if user is typing in an input or textarea
            // EXCEPT when a modifier (Alt/Cmd/Ctrl) is held.
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (!isMod && !isAlt) return;
            }

            if (isMod && e.code === 'KeyK') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
                return;
            }

            if (isAlt) {
                const key = e.key.toLowerCase();
                const code = e.code;

                if (code === 'KeyD' || key === 'd' || key === '∂') {
                    e.preventDefault();
                    navigate('/app/v1/dashboard');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyT' || key === 't' || key === '†') {
                    e.preventDefault();
                    navigate('/app/v1/tasks');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyC' || key === 'c' || key === 'ç') {
                    e.preventDefault();
                    navigate('/app/v1/calendar');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyP' || key === 'p' || key === 'π') {
                    e.preventDefault();
                    navigate('/app/v1/team');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyM' || key === 'm' || key === 'µ') {
                    e.preventDefault();
                    navigate('/app/v1/messages');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyS' || key === 's' || key === 'ß') {
                    e.preventDefault();
                    navigate('/app/v1/settings');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyF' || key === 'f' || key === 'ƒ') {
                    e.preventDefault();
                    navigate('/app/v1/focus');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyN' || key === 'n' || key === '˜') {
                    e.preventDefault();
                    navigate('/app/v1/notifications');
                    setIsCommandPaletteOpen(false);
                } else if (code === 'KeyQ' || key === 'q' || key === 'œ') {
                    e.preventDefault();
                    openCreateModal();
                } else if (code === 'KeyK' || key === 'k' || key === '˚') {
                    e.preventDefault();
                    setIsCommandPaletteOpen(prev => !prev);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, openCreateModal]);

    return (
        <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden transition-colors">
            {/* Offline Banner */}
            <OfflineBanner />
            {/* ✅ FIX: AnalyticsTracker inside Router context */}
            <AnalyticsTracker />
            <TacticalOverlay />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-0 scroll-smooth">
                    <div className="max-w-[1800px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            {/* Floating Timer Widget - appears when Focus Mode is active */}
            <FloatingTimerWidget />
            {/* Notification Permission Banner */}
            <NotificationPermissionBanner />
            {/* Global Search & Command Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
            <FlowBotWidget />

            {/* Context Modals - Rendered here to prevent circular dependency issues */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onCreate={handleCreateTask}
                initialDate={initialDate}
            />

            {selectedTask && (
                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    task={selectedTask}
                    onClose={closeDetailsModal}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}
        </div>
    );
}
