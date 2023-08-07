import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import dbConnect from "./config/dbConnectFile.js";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";

const PORT = process.env.PORT || 5002;

// RAZORPAY
export const razorpay = new Razorpay({
  key_id: process.env.PAYMENT_KEY_ID,
  key_secret: process.env.PAYMENT_KEY_SECRET,
});

// CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(PORT, async () => {
  await dbConnect();
  console.log(`server is running at localhost :${PORT}`);
});
