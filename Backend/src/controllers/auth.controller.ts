import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ClientModel } from "../models/client.model";
import { UserModel } from "../models/user.model";
import { SecurityUtils } from "../utils/security";

export const AuthController = {
    async registerUser(req: Request, res: Response) {
        try {
            const { email, password, fullName, role, phone } = req.body;

            const existing = await UserModel.findByEmail(email);
            if (existing) {
                return res.status(400).json({ error: "Email ya registrado" });
            }

            await UserModel.create(email, password, fullName, role, phone);

            res.status(201).json({ message: "Usuario creado exitosamente" });
        } catch (error) {
            console.error("Register error:", error);
            res.status(500).json({ error: "Error al registrar usuario" });
        }
    },

    async registerClient(req: Request, res: Response) {
        try {
            const { fullName, phone, email, password } = req.body;

            if (!SecurityUtils.validatePhone(phone)) {
                return res.status(400).json({ error: "Teléfono inválido" });
            }

            if (email && !SecurityUtils.validateEmail(email)) {
                return res.status(400).json({ error: "Email inválido" });
            }

            const existing = await ClientModel.findByPhone(phone);
            if (existing) {
                return res.status(400).json({ error: "Teléfono ya registrado" });
            }

            await ClientModel.create(fullName, phone, password, email);

            res.status(201).json({ message: "Cliente registrado exitosamente" });
        } catch (error) {
            console.error("Register client error:", error);
            res.status(500).json({ error: "Error al registrar cliente" });
        }
    },

    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            const valid = await SecurityUtils.comparePassword(password, user.password_hash);
            if (!valid) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            await UserModel.updateLastLogin(user.id);

            // SOLUCIÓN: Usar el sign con los parámetros correctos
            const token = jwt.sign({ userId: user.id, role: user.role, type: "user" }, env.JWT_SECRET, {
                expiresIn: env.JWT_EXPIRES_IN,
            });

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    profileImage: user.profile_image,
                    phone: user.phone,
                },
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Error al iniciar sesión" });
        }
    },

    async loginClient(req: Request, res: Response) {
        try {
            const { phone, password } = req.body;

            const client = await ClientModel.findByPhone(phone);
            if (!client) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            const valid = await SecurityUtils.comparePassword(password, client.password_hash);
            if (!valid) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            // SOLUCIÓN: Usar el sign con los parámetros correctos
            const token = jwt.sign({ userId: client.id, type: "client" }, env.JWT_SECRET, {
                expiresIn: env.JWT_EXPIRES_IN,
            });

            res.json({
                token,
                client: {
                    id: client.id,
                    fullName: client.full_name,
                    phone: client.phone,
                    email: client.email,
                    profileImage: client.profile_image,
                },
            });
        } catch (error) {
            console.error("Client login error:", error);
            res.status(500).json({ error: "Error al iniciar sesión" });
        }
    },

    async getMe(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const userType = (req as any).userType;

            if (userType === "client") {
                const client = await ClientModel.findById(userId);
                if (!client) {
                    return res.status(404).json({ error: "Cliente no encontrado" });
                }
                return res.json({ client });
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json({ user });
        } catch (error) {
            console.error("Get me error:", error);
            res.status(500).json({ error: "Error al obtener información" });
        }
    },
};
