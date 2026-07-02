import fs from "fs";
import multer from "multer";
import path from "path";
import { storageConfig } from "../config/storage";
import { AppError } from "./error.middleware";

if (!fs.existsSync(storageConfig.uploadPath)) {
    fs.mkdirSync(storageConfig.uploadPath, { recursive: true });
}

const photoPath = path.join(storageConfig.uploadPath, storageConfig.photoSubPath);
if (!fs.existsSync(photoPath)) {
    fs.mkdirSync(photoPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, photoPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `barber_${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedExtensions = storageConfig.allowedExtensions;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new AppError(`Formato no permitido. Permitidos: ${allowedExtensions.join(", ")}`, 400), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: storageConfig.maxFileSize,
    },
    fileFilter: fileFilter,
});

export const uploadSingle = upload.single("photo");
export const uploadMultiple = upload.array("photos", 10);
