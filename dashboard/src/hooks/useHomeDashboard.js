import { useCallback, useEffect, useState } from "react";
import { getBarberWeekAppointments } from "../services/appointments";
import { getMyPhotos } from "../services/photos";
import { getMyProfile } from "../services/profile";
import { getMySchedules, getScheduleSlots } from "../services/schedules";
import { addDays, getMonday, parseWorkDays, toISODate } from "../utils/date";

const MAX_PHOTOS = 4;
const DAY_NAMES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const fetchAllWeekAppointments = async weekStartIso => {
    const first = await getBarberWeekAppointments(weekStartIso, 1, 50);
    let all = first.data;
    const totalPages = first.pagination?.totalPages || 1;

    for (let page = 2; page <= totalPages; page += 1) {
        const next = await getBarberWeekAppointments(weekStartIso, page, 50);
        all = all.concat(next.data);
    }

    return all;
};

const buildAlerts = ({ hasScheduleThisWeek, hasScheduleNextWeek, profile, photosCount }) => {
    const alerts = [];

    if (!hasScheduleThisWeek) {
        alerts.push({
            id: "no-schedule-week",
            message: "No abriste tu agenda de esta semana.",
            actionLabel: "Abrir agenda",
            to: "/schedule",
        });
    } else if (!hasScheduleNextWeek) {
        alerts.push({
            id: "no-schedule-next-week",
            message: "Todavía no configuraste tu agenda de la semana que viene.",
            actionLabel: "Configurar",
            to: "/schedule",
        });
    }

    if (!Number(profile?.service_price)) {
        alerts.push({
            id: "missing-price",
            message: "No configuraste el precio de tu servicio.",
            actionLabel: "Configurar precio",
            to: "/profile",
        });
    }

    if (!profile?.bio) {
        alerts.push({
            id: "missing-bio",
            message: "Tu descripción de perfil está vacía.",
            actionLabel: "Completar descripción",
            to: "/photos",
        });
    }

    if (photosCount < MAX_PHOTOS) {
        alerts.push({
            id: "missing-photos",
            message: `Tenés ${photosCount} de ${MAX_PHOTOS} fotos subidas.`,
            actionLabel: "Subir fotos",
            to: "/photos",
        });
    }

    return alerts;
};

export const useHomeDashboard = barberId => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const load = useCallback(async () => {
        if (!barberId) return;
        setLoading(true);

        const now = new Date();
        const weekStart = getMonday(now);
        const weekStartIso = toISODate(weekStart);
        const nextWeekStartIso = toISODate(addDays(weekStart, 7));
        const todayIso = toISODate(now);
        const todayDayName = DAY_NAMES[now.getDay()];

        const [schedulesResult, profileResult, photosResult, slotsResult, appointmentsResult] = await Promise.allSettled([
            getMySchedules(),
            getMyProfile(),
            getMyPhotos(),
            getScheduleSlots(barberId, weekStartIso),
            fetchAllWeekAppointments(weekStartIso),
        ]);

        const schedules = schedulesResult.status === "fulfilled" ? schedulesResult.value : [];
        const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
        const photos = photosResult.status === "fulfilled" ? photosResult.value : [];
        const slotsData = slotsResult.status === "fulfilled" ? slotsResult.value : null;
        const appointmentsThisWeek = appointmentsResult.status === "fulfilled" ? appointmentsResult.value : [];

        const hasScheduleThisWeek = schedules.some(s => s.week_start.slice(0, 10) === weekStartIso);
        const hasScheduleNextWeek = schedules.some(s => s.week_start.slice(0, 10) === nextWeekStartIso);

        const todayAppointments = appointmentsThisWeek.filter(a => a.date.slice(0, 10) === todayIso);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        const nextClient =
            todayAppointments
                .filter(a => a.status === "active")
                .filter(a => {
                    const [h, m] = a.time.split(":").map(Number);
                    return h * 60 + m >= nowMinutes;
                })
                .sort((a, b) => a.time.localeCompare(b.time))[0] || null;

        const completedThisWeek = appointmentsThisWeek.filter(a => a.status === "completed").length;

        let freeSlotsToday = null;
        let isTodayWorkDay = false;

        if (slotsData) {
            const workDays = parseWorkDays(slotsData.work_days);
            isTodayWorkDay = workDays.includes(todayDayName);

            if (isTodayWorkDay) {
                const bookedToday = new Set(todayAppointments.map(a => a.time.slice(0, 5)));
                freeSlotsToday = slotsData.slots.filter(s => !bookedToday.has(s)).length;
            } else {
                freeSlotsToday = 0;
            }
        }

        let occupancyPercent = null;
        if (slotsData && slotsData.slots.length > 0) {
            const workDays = parseWorkDays(slotsData.work_days);
            const totalCapacity = slotsData.slots.length * workDays.length;
            if (totalCapacity > 0) {
                occupancyPercent = Math.round((appointmentsThisWeek.length / totalCapacity) * 100);
            }
        }

        const alerts = buildAlerts({
            hasScheduleThisWeek,
            hasScheduleNextWeek,
            profile,
            photosCount: photos.length,
        });

        setData({
            alerts,
            hasScheduleThisWeek,
            hasScheduleNextWeek,
            todayAppointments,
            appointmentsThisWeek,
            nextClient,
            completedThisWeek,
            freeSlotsToday,
            isTodayWorkDay,
            occupancyPercent,
        });
        setLoading(false);
    }, [barberId]);

    useEffect(() => {
        load();
    }, [load]);

    return { loading, data, reload: load };
};
