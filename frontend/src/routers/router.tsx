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
import { ErrorBoundary } from "../components/ErrorBoundary";

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
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));

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
                    <ErrorBoundary>
                        <Suspense fallback={<DashboardSkeleton />}>
                            <Dashboard />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "calendar", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <Calendar />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "tasks", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <TasksPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "tasks/new", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <CreateTaskPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "team", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <TeamPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "messages", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <MessagesPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "messages/:chatId", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <MessagesPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "invitations", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <InvitationsPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "notifications", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <NotificationsPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "settings", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <SettingsPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "focus/history", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <FocusHistoryPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "achievements", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <AchievementsPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
            { 
                path: "analytics", 
                element: (
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <AnalyticsPage />
                        </Suspense>
                    </ErrorBoundary>
                )
            },
        ]
    },
    // ✅ FIX: FocusMode routes outside DashboardLayout for fullscreen display
    {
        path: "/app/v1/focus",
        element: (
            <ProtectedRoute>
                <UserProvider>
                    <WebSocketProvider>
                        <ProjectProvider>
                            <FocusProvider>
                                <TaskProvider>
                                    <ErrorBoundary>
                                        <Suspense fallback={<PageLoader />}>
                                            <FocusMode />
                                        </Suspense>
                                    </ErrorBoundary>
                                </TaskProvider>
                            </FocusProvider>
                        </ProjectProvider>
                    </WebSocketProvider>
                </UserProvider>
            </ProtectedRoute>
        )
    },
    {
        path: "/app/v1/focus/:taskId",
        element: (
            <ProtectedRoute>
                <UserProvider>
                    <WebSocketProvider>
                        <ProjectProvider>
                            <FocusProvider>
                                <TaskProvider>
                                    <ErrorBoundary>
                                        <Suspense fallback={<PageLoader />}>
                                            <FocusMode />
                                        </Suspense>
                                    </ErrorBoundary>
                                </TaskProvider>
                            </FocusProvider>
                        </ProjectProvider>
                    </WebSocketProvider>
                </UserProvider>
            </ProtectedRoute>
        )
    },

]);
