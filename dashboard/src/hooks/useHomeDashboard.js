import { useCallback, useEffect, useState } from "react";
import { getAllUsers, getFinancialPeriod, getFinancialSummary } from "../services/admin";
import { getBarberWeekAppointments } from "../services/appointments";
import { getClients } from "../services/clients";
import { getMyPhotos } from "../services/photos";
import { getMyProfile } from "../services/profile";
import { getMySchedules, getScheduleSlots } from "../services/schedules";
import { DAY_NAMES, addDays, getMonday, parseWorkDays, toISODate } from "../utils/date";
import { getAvailableSlots } from "../utils/slots";

const MAX_PHOTOS = 4;

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

const sumCompletedRevenue = appointments =>
    appointments.filter(a => a.status === "completed").reduce((sum, a) => sum + Number(a.price), 0);

const loadAgendaPanel = async barberId => {
    const now = new Date();
    const weekStart = getMonday(now);
    const weekStartIso = toISODate(weekStart);
    const nextWeekStartIso = toISODate(addDays(weekStart, 7));
    const todayIso = toISODate(now);
    const todayDayName = DAY_NAMES[now.getDay()];
    const isSunday = now.getDay() === 0;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthStartIso = toISODate(monthStart);
    const monthEndIso = toISODate(monthEnd);
    const monthWeekStarts = [];
    for (let cursor = getMonday(monthStart); cursor <= monthEnd; cursor = addDays(cursor, 7)) {
        monthWeekStarts.push(toISODate(cursor));
    }

    // weekStartIso y, si hoy es domingo, nextWeekStartIso, ya están cubiertos por
    // monthWeekStarts (siempre incluye la semana actual, y la de agosto si el mes
    // termina en domingo) — se pide cada semana una sola vez para no duplicar requests.
    const neededWeekStarts = Array.from(
        new Set([weekStartIso, ...(isSunday ? [nextWeekStartIso] : []), ...monthWeekStarts]),
    );

    const [schedulesResult, profileResult, photosResult, slotsResult, weeksResult] = await Promise.allSettled([
        getMySchedules(),
        getMyProfile(),
        getMyPhotos(),
        getScheduleSlots(barberId, weekStartIso),
        Promise.all(neededWeekStarts.map(ws => fetchAllWeekAppointments(ws))),
    ]);

    const schedules = schedulesResult.status === "fulfilled" ? schedulesResult.value : [];
    const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
    const photos = photosResult.status === "fulfilled" ? photosResult.value : [];
    const slotsData =
        slotsResult.status === "fulfilled" && slotsResult.value.has_schedule ? slotsResult.value : null;

    const weekAppointmentsByStart = {};
    if (weeksResult.status === "fulfilled") {
        neededWeekStarts.forEach((ws, i) => {
            weekAppointmentsByStart[ws] = weeksResult.value[i];
        });
    }

    const appointmentsThisWeek = weekAppointmentsByStart[weekStartIso] || [];
    const nextWeekAppointments = isSunday ? weekAppointmentsByStart[nextWeekStartIso] || [] : [];
    const monthAppointments = monthWeekStarts
        .flatMap(ws => weekAppointmentsByStart[ws] || [])
        .filter(a => {
            const dateIso = a.date.slice(0, 10);
            return dateIso >= monthStartIso && dateIso <= monthEndIso;
        });

    const hasScheduleThisWeek = schedules.some(s => s.week_start.slice(0, 10) === weekStartIso);
    const hasScheduleNextWeek = schedules.some(s => s.week_start.slice(0, 10) === nextWeekStartIso);
    const thisWeekSchedule = schedules.find(s => s.week_start.slice(0, 10) === weekStartIso);
    const slotDurationMinutes = thisWeekSchedule?.slot_duration_minutes || 0;

    const todayAppointments = appointmentsThisWeek.filter(a => a.date.slice(0, 10) === todayIso);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const tomorrowIso = toISODate(addDays(now, 1));
    const tomorrowSourceList = isSunday ? nextWeekAppointments : appointmentsThisWeek;
    const tomorrowAppointments = tomorrowSourceList.filter(a => a.date.slice(0, 10) === tomorrowIso);

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
            // Reusa la misma lógica que el formulario de turnos: además de
            // descontar los horarios ya reservados, descarta los que ya
            // pasaron hoy — si no, "horarios libres hoy" a las 9pm sigue
            // contando turnos de las 10am como disponibles.
            freeSlotsToday = getAvailableSlots(slotsData.slots, todayAppointments, todayIso).length;
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

    const hoursWorkedThisWeek = slotDurationMinutes ? (completedThisWeek * slotDurationMinutes) / 60 : null;
    const hoursAvailableToday =
        slotDurationMinutes && freeSlotsToday !== null ? (freeSlotsToday * slotDurationMinutes) / 60 : null;

    const revenueToday = sumCompletedRevenue(todayAppointments);
    const revenueThisWeek = sumCompletedRevenue(appointmentsThisWeek);
    const revenueThisMonth = sumCompletedRevenue(monthAppointments);

    const alerts = buildAlerts({
        hasScheduleThisWeek,
        hasScheduleNextWeek,
        profile,
        photosCount: photos.length,
    });

    return {
        kind: "agenda",
        alerts,
        hasScheduleThisWeek,
        hasScheduleNextWeek,
        todayAppointments,
        tomorrowAppointmentsCount: tomorrowAppointments.length,
        appointmentsThisWeek,
        nextClient,
        completedThisWeek,
        freeSlotsToday,
        isTodayWorkDay,
        occupancyPercent,
        hoursWorkedThisWeek,
        hoursAvailableToday,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
    };
};

const loadBusinessPanel = async () => {
    const now = new Date();
    const todayIso = toISODate(now);
    const weekStart = getMonday(now);
    const weekStartIso = toISODate(weekStart);
    const monthStartIso = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));

    const [
        totalResult,
        recentResult,
        usersResult,
        todayPeriodResult,
        weekPeriodResult,
        monthPeriodResult,
        todaySummaryResult,
    ] = await Promise.allSettled([
        getClients(1, 1),
        getClients(1, 50),
        getAllUsers(1, 50),
        getFinancialPeriod(todayIso, todayIso),
        getFinancialPeriod(weekStartIso, todayIso),
        getFinancialPeriod(monthStartIso, todayIso),
        getFinancialSummary(todayIso, todayIso),
    ]);

    const totalClients = totalResult.status === "fulfilled" ? totalResult.value.pagination.total : null;
    const recentClients = recentResult.status === "fulfilled" ? recentResult.value.data : [];
    const newClientsThisWeek = recentClients.filter(c => c.created_at.slice(0, 10) >= weekStartIso).length;

    const barbers =
        usersResult.status === "fulfilled"
            ? usersResult.value.data.filter(u => u.role === "barber" || u.role === "admin_barber")
            : [];

    const todayPeriod = todayPeriodResult.status === "fulfilled" ? todayPeriodResult.value : null;
    const weekPeriod = weekPeriodResult.status === "fulfilled" ? weekPeriodResult.value : null;
    const monthPeriod = monthPeriodResult.status === "fulfilled" ? monthPeriodResult.value : null;

    const todaySummary = todaySummaryResult.status === "fulfilled" ? todaySummaryResult.value : [];
    const bestBarberToday =
        todaySummary
            .filter(r => Number(r.total_revenue) > 0)
            .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))[0] || null;

    return {
        kind: "business",
        totalClients,
        newClientsThisWeek,
        totalBarbers: barbers.length,
        activeBarbersToday: todayPeriod ? Number(todayPeriod.active_barbers) : null,
        bestBarberToday,
        revenueToday: todayPeriod ? Number(todayPeriod.total_revenue) : null,
        appointmentsToday: todayPeriod ? Number(todayPeriod.total_appointments) : null,
        revenueThisWeek: weekPeriod ? Number(weekPeriod.total_revenue) : null,
        appointmentsThisWeek: weekPeriod ? Number(weekPeriod.total_appointments) : null,
        revenueThisMonth: monthPeriod ? Number(monthPeriod.total_revenue) : null,
        appointmentsThisMonth: monthPeriod ? Number(monthPeriod.total_appointments) : null,
    };
};

export const useHomeDashboard = user => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const hasOwnAgenda = user?.role === "barber" || user?.role === "admin_barber";

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const panel = hasOwnAgenda ? await loadAgendaPanel(user.id) : await loadBusinessPanel();
        setData(panel);
        setLoading(false);
    }, [user, hasOwnAgenda]);

    useEffect(() => {
        load();
    }, [load]);

    return { loading, data, reload: load };
};
