import express from "express"
import cors from "cors"
import authRouter from "./routes/authRouter.js";
import adminRouter from "./routes/adminRouter.js";
import supplierRouter from "./routes/supplier.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));

// routers
app.use("/api/auth", authRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/admin", adminRouter);

export default app;