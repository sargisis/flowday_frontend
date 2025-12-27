import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DailyRitual from "../components/DailyRitual";

export default function DashboardLayout() {
    return (
        <div className="container" style={{ flexDirection: "row", gap: "var(--space-lg)", padding: "var(--space-lg)", maxWidth: "1600px" }}>
            <Sidebar />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                <Outlet />
            </main>
            <DailyRitual />
        </div>

    );
}
