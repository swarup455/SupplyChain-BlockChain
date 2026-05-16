import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import { sendCredentialsMail } from "../utils/sendMail.js";
import { generateCredentials } from "../utils/generateCredentials.js";

export const getAllStakeholders = async (req, res) => {
    try {
        const { role, status, search } = req.query;

        const filter = { role: { $ne: "admin" } };

        if (role && role !== "all") filter.role = role;
        if (status && status !== "all") filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { userId: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const stakeholders = await User.find(filter).select("-password").sort({ createdAt: -1 });

        res.status(200).json({ stakeholders });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch stakeholders." });
    }
};

export const createStakeholder = async (req, res) => {
    try {
        const { name, email, phoneNumbers, role, walletAddress, location } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ message: "Name, email and role are required." });
        }

        const existingEmail = await User.findOne({ email, role });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // ── Auto generate credentials ──────────────────────────
        const { userId, password } = generateCredentials(name, role);

        const user = await User.create({
            userId,
            name,
            email,
            phoneNumbers: phoneNumbers || [],
            password,           // pre-save hook hashes it
            role,
            walletAddress: walletAddress || "",
            location: location || "",
            status: "active",
        });

        // ── Send credentials email ─────────────────────────────
        await sendCredentialsMail({ name, email, userId, password, role });

        res.status(201).json({
            message: "Stakeholder created successfully.",
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                walletAddress: user.walletAddress,
                phoneNumbers: user.phoneNumbers,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create stakeholder." });
    }
};

export const updateStakeholder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumbers, walletAddress, location, role } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Stakeholder not found." });
        if (user.role === "admin") return res.status(403).json({ message: "Cannot modify admin accounts." });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumbers) user.phoneNumbers = phoneNumbers;
        if (walletAddress !== undefined) user.walletAddress = walletAddress;
        if (location !== undefined) user.location = location;
        if (role) user.role = role;

        await user.save();

        res.status(200).json({
            message: "Stakeholder updated successfully.",
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                walletAddress: user.walletAddress,
                phoneNumbers: user.phoneNumbers,
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to update stakeholder." });
    }
};

export const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Stakeholder not found." });
        if (user.role === "admin") return res.status(403).json({ message: "Cannot suspend admin accounts." });

        user.status = user.status === "suspended" ? "active" : "suspended";
        await user.save();

        res.status(200).json({
            message: `Stakeholder ${user.status === "suspended" ? "suspended" : "activated"} successfully.`,
            status: user.status,
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to update status." });
    }
};

export const deleteStakeholder = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Stakeholder not found." });
        if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin accounts." });

        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "Stakeholder deleted successfully." });

    } catch (error) {
        res.status(500).json({ message: "Failed to delete stakeholder." });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Stakeholder not found." });

        user.password = newPassword; // pre-save hook hashes it automatically
        await user.save();

        res.status(200).json({ message: "Password reset successfully." });

    } catch (error) {
        res.status(500).json({ message: "Failed to reset password." });
    }
};