import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function DashboardLayout() {
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
            {/* DailyRitual moved or removed based on new design preferences, kept hidden for now if not compatible */}
            {/* <DailyRitual /> */}
        </div>

    );
}
