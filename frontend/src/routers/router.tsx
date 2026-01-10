import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import TasksPage from "../pages/TasksPage";
import CreateTaskPage from "../pages/CreateTaskPage";
import TeamPage from "../pages/TeamPage";
import SettingsPage from "../pages/SettingsPage";
import InvitationsPage from "../pages/InvitationsPage";
import NotificationsPage from "../pages/NotificationsPage";
import MessagesPage from "../pages/MessagesPage";
import ProtectedRoute from "../components/protected-router/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProjectProvider } from "../context/ProjectContext";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import FocusHistoryPage from "../pages/FocusHistoryPage";
import AchievementsPage from "../pages/AchievementsPage";
import FocusMode from "../pages/FocusMode";
import LandingPage from "../pages/LandingPage";
import Calendar from "../pages/Calendar";
import { UserProvider } from "../context/UserContext";
import { FocusProvider } from "../context/FocusContext";
import { TaskProvider } from "../context/TaskContext";

export const router = createBrowserRouter([
    { path: "/", element: <LandingPage /> },
    { path: "/app/v1", element: <Navigate to="/app/v1/dashboard" replace /> },
    { path: "/app/v1/login", element: <Login /> },
    { path: "/app/v1/register", element: <Register /> },
    { path: "/app/v1/forgot-password", element: <ForgotPassword /> },
    { path: "/app/v1/reset-password", element: <ResetPassword /> },
    {
        path: "/app/v1",
        element: (
            <ProtectedRoute>
                <UserProvider>
                    <ProjectProvider>
                        <FocusProvider>
                            <TaskProvider>
                                <DashboardLayout />
                            </TaskProvider>
                        </FocusProvider>
                    </ProjectProvider>
                </UserProvider>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/app/v1/dashboard" replace /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "calendar", element: <Calendar /> },
            { path: "tasks", element: <TasksPage /> },
            { path: "tasks/new", element: <CreateTaskPage /> },
            { path: "team", element: <TeamPage /> },
            { path: "messages", element: <MessagesPage /> },
            { path: "messages/:chatId", element: <MessagesPage /> },
            { path: "invitations", element: <InvitationsPage /> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "focus", element: <FocusMode /> },
            { path: "focus/:taskId", element: <FocusMode /> },
            { path: "focus/history", element: <FocusHistoryPage /> },
            { path: "achievements", element: <AchievementsPage /> },
        ]
    },

]);
