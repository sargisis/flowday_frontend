import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../components/protected-router/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProjectProvider } from "../context/ProjectContext";
import { UserProvider } from "../context/UserContext";
import { FocusProvider } from "../context/FocusContext";
import { TaskProvider } from "../context/TaskContext";
import { WebSocketProvider } from "../context/WebSocketContext";
import { DashboardSkeleton } from "../components/SkeletonLoader";

// Lazy load pages for code splitting and faster initial load
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const TasksPage = lazy(() => import("../pages/TasksPage"));
const CreateTaskPage = lazy(() => import("../pages/CreateTaskPage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const InvitationsPage = lazy(() => import("../pages/InvitationsPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const MessagesPage = lazy(() => import("../pages/MessagesPage"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const FocusHistoryPage = lazy(() => import("../pages/FocusHistoryPage"));
const AchievementsPage = lazy(() => import("../pages/AchievementsPage"));
const FocusMode = lazy(() => import("../pages/FocusMode"));
const Calendar = lazy(() => import("../pages/Calendar"));

// Simple loading fallback component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-400">Loading...</p>
        </div>
    </div>
);

export const router = createBrowserRouter([
    { 
        path: "/", 
        element: (
            <Suspense fallback={<PageLoader />}>
                <LandingPage />
            </Suspense>
        )
    },
    { path: "/app/v1", element: <Navigate to="/app/v1/dashboard" replace /> },
    { 
        path: "/app/v1/login", 
        element: (
            <Suspense fallback={<PageLoader />}>
                <Login />
            </Suspense>
        )
    },
    { 
        path: "/app/v1/register", 
        element: (
            <Suspense fallback={<PageLoader />}>
                <Register />
            </Suspense>
        )
    },
    { 
        path: "/app/v1/forgot-password", 
        element: (
            <Suspense fallback={<PageLoader />}>
                <ForgotPassword />
            </Suspense>
        )
    },
    { 
        path: "/app/v1/reset-password", 
        element: (
            <Suspense fallback={<PageLoader />}>
                <ResetPassword />
            </Suspense>
        )
    },
    {
        path: "/app/v1",
        element: (
            <ProtectedRoute>
                <UserProvider>
                    <WebSocketProvider>
                        <ProjectProvider>
                            <FocusProvider>
                                <TaskProvider>
                                    <DashboardLayout />
                                </TaskProvider>
                            </FocusProvider>
                        </ProjectProvider>
                    </WebSocketProvider>
                </UserProvider>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/app/v1/dashboard" replace /> },
            { 
                path: "dashboard", 
                element: (
                    <Suspense fallback={<DashboardSkeleton />}>
                        <Dashboard />
                    </Suspense>
                )
            },
            { 
                path: "calendar", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Calendar />
                    </Suspense>
                )
            },
            { 
                path: "tasks", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <TasksPage />
                    </Suspense>
                )
            },
            { 
                path: "tasks/new", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <CreateTaskPage />
                    </Suspense>
                )
            },
            { 
                path: "team", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <TeamPage />
                    </Suspense>
                )
            },
            { 
                path: "messages", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <MessagesPage />
                    </Suspense>
                )
            },
            { 
                path: "messages/:chatId", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <MessagesPage />
                    </Suspense>
                )
            },
            { 
                path: "invitations", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <InvitationsPage />
                    </Suspense>
                )
            },
            { 
                path: "notifications", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <NotificationsPage />
                    </Suspense>
                )
            },
            { 
                path: "settings", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <SettingsPage />
                    </Suspense>
                )
            },
            { 
                path: "focus", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <FocusMode />
                    </Suspense>
                )
            },
            { 
                path: "focus/:taskId", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <FocusMode />
                    </Suspense>
                )
            },
            { 
                path: "focus/history", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <FocusHistoryPage />
                    </Suspense>
                )
            },
            { 
                path: "achievements", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <AchievementsPage />
                    </Suspense>
                )
            },
        ]
    },

]);
