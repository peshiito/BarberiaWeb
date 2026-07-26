import bcrypt from "bcrypt";
import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { findById, updateUserBio, updateUserPassword, updateUserProfileDetails } from "../models/user.model";

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

export const updateMyProfileDetails = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { first_name, last_name, service_price } = req.body;

    await updateUserProfileDetails(userId, { first_name, last_name, service_price });

    const user = await findById(userId);
    const { password_hash, ...profile } = user!;
    return res.json(profile);
};

export const changeMyPassword = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;

    const user = await findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: "Current password is incorrect" });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await updateUserPassword(userId, password_hash);

    return res.json({ message: "Password updated" });
};
