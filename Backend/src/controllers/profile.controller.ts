import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { findById, updateUserBio } from "../models/user.model";

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const user = await findById(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { password_hash, ...profile } = user;
    return res.json(profile);
};

export const updateMyBio = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { bio } = req.body;

    await updateUserBio(userId, bio);
    return res.json({ message: "Profile updated" });
};
