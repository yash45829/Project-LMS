import User from "../models/user.model.js";

const cookieOptions = {
    maxAge : 7*24*60*60*1000 ,
    httpOnly : true,
    secure : true 
}

// REGISTER 
const register = async (req,res)=>{

const {firstname , email ,password,role} = req.body;

if(!firstname || !email || !password){
 return res.status(500).send('required email');
}

const isUserExist = await User.findOne({email});

if(isUserExist){
    return res.status(500).send('account exist');
}

const user = await User.create({
firstname,
email,
password,
role
})

if(!user){
    return res.status(500).send('not created');
}
// todo : image upload 

await user.save();

user.password = undefined ;

const token  = user.generateJWTToken();

res.cookie('token',token,cookieOptions);

res.status(200).json({
    success : true ,
    message : 'user created happy',
    user
})

}

// LOGIN 
const login = (req,res)=>{
    try {
        const {email ,password} = req.body;

        if(!email || !password){
            return res.status(500).send('required email');
           }
        
        const user = User.findOne({email}).select('+password');
    
        if(!user || !user.comparePassword(password)){
         return res.status(500).send('email or password are wrong');
        }

        user.password = undefined ;
        const token = user.generateJWTToken();
        
        res.cookie('token',token,cookieOptions);

        res.status(200).json({
         success : true ,
         message : 'login user',
         user
        })

    } catch (error) {
        return res.status(500).send(`email or password are wrong this is ${error}`);
    }
   
}

// LOGOUT 

const logout = (req,res)=>{
 try {
  res.cookie('token',null,{
    maxAge : 0,
    httpOnly : true,
    secure: true
  })

  res.status(200).json({
    success: true,
    message : 'logout container',

  })
 } catch (error) {
  res.status(400).json({
    message: `${error}`
  })
 }

}

// PROFILE 
const profile = async (req,res)=>{
  
  const userId = req.user.id;
  const user = await User.findById({userId});
  
  res.status(200).json({
    success : true ,
    message : 'find profile',
    user
  })
}

export{
    register,
    login,
    logout,
    profile
}