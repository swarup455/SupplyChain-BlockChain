import bcrypt from "bcryptjs";
import User from "../models/auth.model.js";

const createAdmin = async () => {
    try {

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists");
            return;
        }

        await User.create({
            userId: "ADMIN001",
            name: "Super Admin",
            email: "admin@trackchain.com",
            password: "admin123",
            role: "admin",
            status: "active"
        });

        console.log("✅ Default admin created");

    } catch (error) {
        console.log("❌ Admin creation failed:", error.message);
    }
};

export default createAdmin;