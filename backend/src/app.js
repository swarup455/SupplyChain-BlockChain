import express from "express"
import cors from "cors"
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//routers setup in express app
app.use("/api/auth", authRouter);

export default app;