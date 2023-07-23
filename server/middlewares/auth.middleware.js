import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const isLoggedIn = (req,res,next)=>{
    const {token} = req.cookie;
    if(!token){
        res.status(401).json({
            success : false,
            message : 'not login in container'
        })
    }

    const userDetail = jwt.verify(token,process.env.JWT_SECRET)
    res.user = userDetail ;
    
    next();
}

export{
    isLoggedIn
}