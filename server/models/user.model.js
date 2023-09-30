import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new Schema(
  {
    firstname: {
      type: "String",
      maxLength: [20, "max lenght is 20"],
      minLength: [4, "min length is 4"],
      required: [true, "is required"],
      trim: true,
    },
    email: {
      type: "String",
      required: [true, "is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      required: [true, "is required"],
      type: "String",
      // trim: true,
      // minLength: [4, "min length is 4"],
      select: false,
    },
    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgetPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
      id: "String",
      status: "String",
    },
  },
  {
    timestamp: true,
  }
);

// making password secure
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// User Methods
userSchema.methods = {
  //   GENERATE TOKEN
  generateJWTToken: async function () {
    return await jwt.sign(
      {
        id: this._id,
        email: this.email,
        firstname: this.firstname,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 1 * 60 * 60,
        // expiresIn : process.env.JWT_EXPIRY
      }
    );
  },
  // PASSWORD MATCHING
  comparePassword: async function (rawPassword) {
    const check = await bcrypt.compare(rawPassword, this.password);
   return check ;
},

  //  GENERATE RESET PW TOKEN
  generateResetPasswordToken: () => {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.forgetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    return resetToken;
  },
};

const User = mongoose.model("User", userSchema);
export default User;
