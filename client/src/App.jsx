import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/authStore';
import useUIStore from './store/uiStore';
import AppLayout from './components/layout/AppLayout';
import Skeleton from './components/ui/Skeleton';
import OfflineBanner from './components/ui/OfflineBanner';

// Lazy-load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EventsListPage = lazy(() => import('./pages/EventsListPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const MasterSevekariPage = lazy(() => import('./pages/MasterSevekariPage'));
const MasterInventoryPage = lazy(() => import('./pages/MasterInventoryPage'));
const VendorsPage = lazy(() => import('./pages/VendorsPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: true,
            retry: 2,
        },
    },
});

// Loading fallback
const PageLoader = () => (
    <div className="page-container space-y-4 pt-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
    </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

// Admin/Engineer route guard
const AdminRoute = ({ children }) => {
    const isAdmin = useAuthStore((s) => s.isAdmin);
    if (!isAdmin()) return <Navigate to="/dashboard" replace />;
    return children;
};

// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err) {
        console.error('Page Error:', err);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-6xl mb-4">🙏</p>
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-[var(--color-text-muted)] mb-4">Please refresh the page and try again.</p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)]"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    const initTheme = useUIStore((s) => s.initTheme);
    const checkAuth = useAuthStore((s) => s.checkAuth);
    const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;
        initTheme();
        checkAuth();
    }, [checkAuth, initTheme]);

    if (isCheckingAuth) {
        return <PageLoader />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <OfflineBanner />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '0.75rem',
                        },
                    }}
                />
                <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="events" element={<EventsListPage />} />
                                <Route path="events/:eventId" element={<EventDetailPage />} />
                                <Route path="master/sevekaris" element={<MasterSevekariPage />} />
                                <Route path="master/inventory" element={<MasterInventoryPage />} />
                                <Route path="vendors" element={<VendorsPage />} />
                                <Route path="admin/users" element={
                                    <AdminRoute><UserManagementPage /></AdminRoute>
                                } />
                            </Route>
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
