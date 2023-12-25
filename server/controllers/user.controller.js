import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import comparePassword from "../models/user.model.js";
import crypto from "crypto";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";

// session time
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
  SameSite : 'none',
};

// REGISTER
const register = async (req, res) => {
  try {
    const { firstname, email, password } = req.body;

    if (!firstname || !email || !password) {
      return res.status(500).send("required email");
    }

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(500).send("account exist");
    }

    const user = await User.create({
      firstname,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url: "",
      },
    });

    if (!user) {
      return res.status(500).send("not created");
    }

    // uploading file to cloudinary
    if (req.file) {
      try {
        const result = cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (result) {
          user.avatar.public_id = (await result).public_id;
          user.avatar.secure_url = (await result).secure_url;

          fs.rm(`uploads/${req.file.filename}`)
        }
      } catch (error) {
        return res.status(500).send("error in saving image");
      }
    }

    await user.save();

    user.password = undefined;

    const token = user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "user created happy",
      user,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
/**************************************************************** */
// LOGIN
const login = async (req, res) => {
  try {
    const {email, password} = await req.body;
    if (!email) {
      return res.status(500).json({
        message: "email not "
      })
    }

    if (!password) {
      return res.status(500).json({
        message: "password not "
      })
    }

   
   const user = await User.findOne({ email }).select("+password");
  
    if (!user || !user.comparePassword(password)) {
      return res.status(500).json({
        message: "email or password  not match"
      })
    }
 

    user.password = undefined;
    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "login user",
      user,
    });
  } catch (error) {
    return res.status(500).send(`email or password are wrong this is ${error}`);
  }
};
/**************************************************************** */
// LOGOUT
const logout = (req, res) => {
  try {
    res.cookie("token", null, {
      maxAge: 0,
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "logged out successfully",
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
/**************************************************************** */
// PROFILE
const profile = async (req, res) => {
  try {
    const userId = await  req.user.id;
    const user = await User.findById(userId);

    if(!user){
    res.status(500).json({
      message : "user not find"
    });

    }
    res.status(200).json({
      success: true,
      message: "find profile",
      user,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**************************************************************** */
// UPDATE USER PROFILE
const updateProfile = async (req, res, next) => {

    const { firstname } = await req.body;
    const { id } = req.params;

    const user = await User.findById(id);
  
    if (!user) {
      return res.status(500).json({
        message: "no user exist",
      });
    }
  
    if (firstname) {
      user.firstname = firstname;
    }
  
 
    if (req.file) {
    
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms', 
          width: 250,
          height: 250,
          gravity: 'faces', 
          crop: 'fill',
        });
  
        
        if (result) {
          
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
  
         
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return  res.status(500).json({
          message: error.message    
        });
      }
    }
  
    // Save the user object
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "profile update",
      user,
    });
};


/**************************************************************** */
// FORGET PASSWORD TOKEN
const forgotPasswordToken = async () => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(500).send("required email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(500).send("email not exist");
    }

    const resetToken = await user.generateResetPasswordToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = `reset password link`;
    const message = `You can reset your password by clicking <a href=${resetPasswordURL}>`;

    try {
      await sendEmail(email, subject, message);

      res.status(200).json({
        success: true,
        message: `reset password token sent to ${email} successfully`,
      });
    } catch (e) {
      user.forgetPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      user.save();
      return res.status(500).send(`error occur ${e.message}`);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
};
/**************************************************************** */
// RESET PASSWORD USING TOKEN
const resetPassword = async () => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(500).send("invalid user");
    }

    user.password = password;
    user.forgetPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
  } catch (e) {
    res.status(500).send(e.message);
  }
};
/**************************************************************** */
// CHANGE PASSWORD WHILE LOGGEDIN
const changePassword = async () => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(500).send("required password");
    }

    const user = await User.findById({ userId }).select("+password");

    if (!user) {
      return res.status(500).send("invalid user");
    }
    if (!comparePassword(oldPassword)) {
      return res.status(500).send("old password are wrong");
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "changed password",
      user,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export {
  register,
  login,
  logout,
  profile,
  updateProfile,
  forgotPasswordToken,
  resetPassword,
  changePassword,
};
