import dotenv from 'dotenv'
dotenv.config()
import app from './app.js'
import dbConnect from './config/dbConnectFile.js';

const PORT = process.env.PORT || 5002;

app.listen(PORT,async ()=>{
    await dbConnect();
  console.log(`server is running at localhost :${PORT}`);
})

