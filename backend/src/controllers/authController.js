import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

const sendToken = (user, res) => {
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

export const login = async (req, res) => {
    try {
        const { userId, password, role } = req.body;

        if (!userId || !password || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        if (user.role !== role) {
            return res.status(403).json({ message: "Access denied for this role." });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect!" });
        }

        sendToken(user, res);

        res.status(200).json({
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed." });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({ message: "Logged out successfully." });
};

export const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        res.status(200).json({ user: req.user });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user." });
    }
};