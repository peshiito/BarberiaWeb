import api from "./api";

export const getMyProfile = async () => {
    const { data } = await api.get("/profile/me");
    return data;
};

export const updateMyBio = async bio => {
    const { data } = await api.patch("/profile/me", { bio });
    return data;
};
