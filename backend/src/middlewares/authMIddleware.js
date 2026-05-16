import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

export const protect = async (req, res, next) => {

    try {

        // ✅ Check cookie exists
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No token"
            });
        }

        // ✅ Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded?.id) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        // ✅ Check user still exists
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // attach user to request
        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token verification failed"
        });

    }
};

// middleware/isAdmin.middleware.js

export const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access only." });
    }
    next();
};