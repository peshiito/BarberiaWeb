import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import AdminBarbers from "./pages/AdminBarbers";
import AdminFinance from "./pages/AdminFinance";
import AgendaHome from "./pages/AgendaHome";
import Login from "./pages/Login";
import Photos from "./pages/Photos";
import Schedule from "./pages/Schedule";

function App() {
    return (
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
                        <Route path="/photos" element={<Photos />} />
                        <Route path="/admin/barbers" element={<AdminBarbers />} />
                        <Route path="/admin/finance" element={<AdminFinance />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
