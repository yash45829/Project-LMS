import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";


export const contactUs = async (req, res, next) => {
  const { name, email, message } = req.body;

  // Checking if values are valid
  if (!name || !email || !message) {
    res.status(500).json({
      message: "Name, Email, Message are required",
    });
  } 

  try {
    const subject = "Contact Us Form";
    const textMessage = `${name} - ${email} <br /> ${message}`;

    // Await the send email
    await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);
  
  res.status(200).json({
    success: true,
    message: "Your request has been submitted successfully",
  });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }

};

export const userStats = async (req,res,next)=>{
try {
   const allUserCount = await User.countDocuments();

   const subscribedCount = await User.countDocuments({
    'subscription.status': 'active'
   })

   res.status(200).json({
    success : true,
    message : "userstat",
    allUserCount,
    subscribedCount

   })
  } catch (error) {
    res.status(500).json({
    error : error.message 
  
     })
  }
}
