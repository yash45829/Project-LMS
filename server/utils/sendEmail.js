import nodemailer from 'nodemailer' ;

const sendEmail = async function(email,subject,message){
let transporter = nodemailer.createTransport({
    host:process.env.STMP_HOST,
    port:process.env.STMP_PORT ,
    secure:true,
    auth:{
        user: process.env.STMP_USERNAME,
        pass: process.env.SMTP_PASS,
    }
});
   await transporter.sendMail({
    from:process.env.STMP_FROM_EMAIL,
    to:email,
    subject:subject,
    html:message,
   }, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
 })
   

};

export default sendEmail;