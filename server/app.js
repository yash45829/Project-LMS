import cookieParser from 'cookie-parser';
import express from 'express'
import cors from 'cors'
import morgan from 'morgan';
import userRoutes from './routes/user.routes';

const app = express();

app.use(morgan('dev'))

app.use(express.json());
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true 
}))
app.use(cookieParser());

app.use('/hello',(req,res)=>{
  res.send('aligarh')
})

app.use('/api/v1/user', userRoutes)

app.all('*',(req,res)=>{
    res.status(500).send('page not found');
})

export default app ;