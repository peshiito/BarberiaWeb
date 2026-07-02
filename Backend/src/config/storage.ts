import path from "path";
import { env } from "./env";

export const storageConfig = {
    uploadPath: path.join(process.cwd(), env.UPLOAD_PATH),
    maxFileSize: env.MAX_FILE_SIZE,
    allowedExtensions: env.ALLOWED_EXTENSIONS,
    photoSubPath: "barber-photos",
};

export const getPhotoUrl = (filename: string): string => {
    return `/uploads/barber-photos/${filename}`;
};

export const getPhotoPath = (filename: string): string => {
    return path.join(storageConfig.uploadPath, storageConfig.photoSubPath, filename);
};
