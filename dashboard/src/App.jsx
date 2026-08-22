import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Skeleton from "./components/ui/Skeleton";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./context/AuthContext";
import AgendaHome from "./pages/AgendaHome";
import Login from "./pages/Login";

const AdminBarbers = lazy(() => import("./pages/AdminBarbers"));
const AdminFinance = lazy(() => import("./pages/AdminFinance"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const Clients = lazy(() => import("./pages/Clients"));
const Photos = lazy(() => import("./pages/Photos"));
const Profile = lazy(() => import("./pages/Profile"));
const Schedule = lazy(() => import("./pages/Schedule"));

const ADMIN_ROLES = ["admin", "admin_barber"];
const BARBER_ROLES = ["barber", "admin_barber"];

const RouteFallback = () => (
    <div className="route-fallback">
        <Skeleton height="52px" />
        <Skeleton height="240px" />
    </div>
);

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Suspense fallback={<RouteFallback />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />

                            <Route
                                element={
                                    <ProtectedRoute>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="/" element={<AgendaHome />} />
                                <Route path="/clients" element={<Clients />} />
                                <Route
                                    path="/schedule"
                                    element={
                                        <ProtectedRoute roles={BARBER_ROLES}>
                                            <Schedule />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/profile" element={<Profile />} />
                                <Route
                                    path="/photos"
                                    element={
                                        <ProtectedRoute roles={BARBER_ROLES}>
                                            <Photos />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/barbers"
                                    element={
                                        <ProtectedRoute roles={ADMIN_ROLES}>
                                            <AdminBarbers />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/finance"
                                    element={
                                        <ProtectedRoute roles={ADMIN_ROLES}>
                                            <AdminFinance />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/services"
                                    element={
                                        <ProtectedRoute roles={ADMIN_ROLES}>
                                            <AdminServices />
                                        </ProtectedRoute>
                                    }
                                />
                            </Route>
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
