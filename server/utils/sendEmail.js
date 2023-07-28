import nodemailer from 'nodemailer' ;

const sendEmail = async function(email,subject,message){
let transporter = nodemailer.createTransport({
    host:process.env.STMP_HOST,
    port:process.env.STMP_PORT,
    secure:false,
    auth:{
        user: process.env.STMP_USERNAME,
        pass: process.env.STMP_PASSWORD,
    }
});
   await transporter.sendMail({
    from:process.env.STMP_FROM_EMAIL,
    to:email,
    subject:subject,
    html:message,
   })

};

export default sendEmail;