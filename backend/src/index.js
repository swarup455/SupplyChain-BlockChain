import dotenv from "dotenv"
dotenv.config({ path: './.env' })
import app from "./app.js";
import connectDB from "./database/database.js";

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.error("Server error:", err);
        });

        const currPort = process.env.PORT || 8000;
        app.listen(currPort, () => {
            console.log(`server is running at port: ${currPort}`)
        })
    })
    .catch((error) => {
        console.log("MongoDB connection failed!!!", error)
    })