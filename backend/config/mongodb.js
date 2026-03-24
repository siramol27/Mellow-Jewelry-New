import mongoose from "mongoose";
import 'dotenv/config'


const conn = async () => {
  try {
    console.log("Mongo URL:", process.env.Mongo_url); // เช็กค่า env

    await mongoose.connect(process.env.Mongo_url);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }
};

export default conn;
