import mongoose  from "mongoose";



const dbConnect = async ()=>{
  try {
    const { connection } = await mongoose.connect(process.env.DB_URI);
    
    if(connection){
        console.log(`database connected at ${connection.host}`)
    }
  } catch (error) {
    console.log(error)
  }
    
}

export default dbConnect ;