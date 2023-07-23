import mongoose  from "mongoose";
import dotenv from 'dotenv'
dotenv.config();


const dbConnect = async ()=>{
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URI);
    
    if(connection){
        console.log(`database connected at ${connection.host}`)
    }
  } catch (error) {
    console.log(error)
  }
    
}

export default dbConnect ;