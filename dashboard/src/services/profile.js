import api from "./api";

export const getMyProfile = async () => {
    const { data } = await api.get("/profile/me");
    return data;
};

export const updateMyBio = async bio => {
    const { data } = await api.patch("/profile/me", { bio });
    return data;
};

export const updateMyProfileDetails = async details => {
    const { data } = await api.patch("/profile/me/details", details);
    return data;
};

export const changeMyPassword = async (current_password, new_password) => {
    const { data } = await api.patch("/profile/me/password", { current_password, new_password });
    return data;
};
