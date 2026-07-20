import api from "./api";

export const getMySchedules = async () => {
    const { data } = await api.get("/schedules/mine");
    return data;
};

export const getScheduleSlots = async (barberId, weekStart) => {
    const { data } = await api.get(`/schedules/${barberId}/${weekStart}/slots`);
    return data;
};

export const createSchedule = async payload => {
    const { data } = await api.post("/schedules", payload);
    return data;
};
