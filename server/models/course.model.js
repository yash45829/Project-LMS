import { Schema,model } from "mongoose";

const courseSchema = new Schema({
    title:{
        type: "String",
        required : [true,"title is required"]
    },
    category:{
        type:"String"
    },
    description:{
        type: "String",
        required : [true,"title is required"],
        minLength : [80,"minimum 100 characters required"]

    },
    lectures:{
        title:{
            type:"String"
        },
        description:{
            type:"String"
        },
        lecture:{
            public_id: "PUBLIC_ID",
            secure_url: "SECURE_URL"
        }
    },
    createdBy:{
        type:"String"
    },
    thumbnail:{
        public_id: "PUBLIC_ID",
        secure_url: "SECURE_URL"
    },
    noOfLectures:{
        type: "Number",
        default : 0 
    }
},
{
    timestamps: true ,
});


const Course = model("COURSE",courseSchema);
export default Course;
