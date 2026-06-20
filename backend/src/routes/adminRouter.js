// routes/admin.routes.js

import express from "express";
import {
    getAllStakeholders,
    createStakeholder,
    updateStakeholder,
    toggleStatus,
    deleteStakeholder,
    resetPassword,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/protect.js";
import { isAdmin } from "../middlewares/protect.js";

const adminRouter = express.Router();

adminRouter.use(protect, isAdmin);

adminRouter.get("/stakeholders", getAllStakeholders);
adminRouter.post("/stakeholders", createStakeholder);
adminRouter.put("/stakeholders/:id", updateStakeholder);
adminRouter.patch("/stakeholders/:id/status", toggleStatus);
adminRouter.delete("/stakeholders/:id", deleteStakeholder);
adminRouter.patch("/stakeholders/:id/reset-password", resetPassword);

export default adminRouter;