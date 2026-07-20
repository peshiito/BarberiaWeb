import api from "./api";

export const getMyPhotos = async () => {
    const { data } = await api.get("/photos/mine");
    return data;
};

export const uploadPhoto = async file => {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await api.post("/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const deletePhoto = async id => {
    const { data } = await api.delete(`/photos/${id}`);
    return data;
};
