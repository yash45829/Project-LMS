import mongoose, {model , Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'

const userSchema = new Schema(
    {
        firstname : {
            type : "String",
            maxLength : [20,'max lenght is 20'],
            minLength : [4 , 'min length is 4'],
            required : [true , 'is required'],
            trim : true
        }, 
        email : {
            type : "String",
            required : [true , 'is required'],
            trim : true,
            lowercase : true ,
            unique : true
        },
        password : {
            required : [true , 'is required'],
            type : 'String',
            trim : true,
            minLength :  [4 , 'min length is 4'],
            select  :false
        },
        avatar : {
            public : {
                type : 'String'
            },
            secure_url :{
                type : 'String'
            }
        },
        role :{
            type : 'String',
            enum:['USER','ADMIN'],
            default : 'USER'
        },
        forgetPasswordToken  : String,
        forgotPasswordExpiry : Date ,
    },
    {
        timestamp : true
    }
);

// making password secure 
userSchema.pre('save', async function(next){
if(!this.isModified('password')){
    return next();
}
this.password = await bcrypt.hash(this.password , 10)
})

// User Methods 
userSchema.methods = {
    // token generating
    generateJWTToken : async function(){
     return await jwt.sign(
        {id: this._id ,email : this.email , firstname : this.firstname,subscription : this.subscription,role:this.role},
        process.env.JWT_SECRET,
        {
            expiresIn : process.env.JWT_EXPIRY
        }
     )
    },
    // password matching
    comparePassword : async function(rawPassword){
        return bcrypt.compare(rawPassword,this.password);
    }
}


const User = model('User' ,userSchema);
export default User ;