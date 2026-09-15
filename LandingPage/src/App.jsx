import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sileo";
import PublicLayout from "./components/layout/PublicLayout";
import RouteFallback from "./components/RouteFallback";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

const Barbers = lazy(() => import("./pages/Barbers"));
const BarberDetail = lazy(() => import("./pages/BarberDetail"));
const Booking = lazy(() => import("./pages/Booking"));
const Branches = lazy(() => import("./pages/Branches"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
    return (
        <ErrorBoundary>
            <Toaster position="bottom-right" />
            <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        <Route element={<PublicLayout />}>
                            <Route index element={<Home />} />
                            <Route path="barberos" element={<Barbers />} />
                            <Route path="barberos/:id" element={<BarberDetail />} />
                            <Route path="reservar" element={<Booking />} />
                            <Route path="sucursales" element={<Branches />} />
                            <Route path="legal/:doc" element={<Legal />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
