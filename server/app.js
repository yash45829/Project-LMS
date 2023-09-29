import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js'
import dotenv from 'dotenv'
dotenv.config();
const app = express(); //created server using express

app.use(morgan('dev')) // for logging 

app.use(express.json());// for parsing json data 

app.use(express.urlencoded({extended: true}))
//for connectivity between frontend and backend
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true 
}))  
app.use(cookieParser());//for parsing cookie data

//general route for testing
app.use('/hello',(req,res)=>{
  res.send('aligarh')
})

//USER ROUTE 
app.use('/api/v1/user', userRoutes)

// COURSE ROUTE 
app.use('/api/v1/course', courseRoutes)

//invalid routes
app.all('*',(req,res)=>{
    res.status(500).send('page not found');
})

export default app ;