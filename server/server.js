import dotenv from 'dotenv'
import app from './app.js'
dotenv.config()
import dbConnect from './config/dbConnectFile.js';

const PORT = process.env.PORT || 5002;

app.listen(PORT,async ()=>{
    await dbConnect();
  console.log(`server is running at localhost :${PORT}`);
})

