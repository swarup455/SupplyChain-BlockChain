import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phoneNumbers: [
            {
                type: String
            }
        ],

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: [
                "supplier",
                "manufacturer",
                "distributor",
                "retailer",
                "customer",
                "admin"
            ],
            required: true
        },

        status: {
            type: String,
            enum: ["active", "suspended", "pending"],
            default: "pending"
        },

        location: {
            type: String,
            default: ""
        },

        walletAddress: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// ── Hash password before saving ─────────────────────────────
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password method ─────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;