import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import TacticalOverlay from "../components/TacticalOverlay";
import FloatingTimerWidget from "../components/FloatingTimerWidget";
import NotificationPermissionBanner from "../components/NotificationPermissionBanner";
import CommandPalette from "../components/CommandPalette";

export default function DashboardLayout() {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <TacticalOverlay />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-8">
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
        </div>
    );
}
