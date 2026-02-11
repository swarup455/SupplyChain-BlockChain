import express from "express";
import { signup, login, logout, getUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMIddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, getUser);

export default authRouter;