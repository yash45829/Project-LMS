import dotenv from 'dotenv'
dotenv.config()
import app from './app.js'
import dbConnect from './config/dbConnectFile.js';
import cloudinary from 'cloudinary';

const PORT = process.env.PORT || 5002;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.listen(PORT,async ()=>{
    await dbConnect();
  console.log(`server is running at localhost :${PORT}`);
})

