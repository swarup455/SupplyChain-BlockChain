import mongoose from "mongoose"
import createAdmin from "../utils/createAdmin.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`\n MongoDB connected !! DB host: ${connectionInstance.connection.host}`)
        await createAdmin();

    } catch (error) {
        console.log("Mongodb connection error", error);
        process.exit(1)
    }
}

export default connectDB