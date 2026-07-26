import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./context/AuthContext";
import AdminBarbers from "./pages/AdminBarbers";
import AdminFinance from "./pages/AdminFinance";
import AgendaHome from "./pages/AgendaHome";
import Login from "./pages/Login";
import Photos from "./pages/Photos";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";

const ADMIN_ROLES = ["admin", "admin_barber"];

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <AuthProvider>
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
                            <Route path="/schedule" element={<Schedule />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/photos" element={<Photos />} />
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
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
