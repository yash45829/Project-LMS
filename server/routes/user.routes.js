import { Router } from "express";

const router = Router();

import { changePassword, forgotPasswordToken, login, logout, profile, register, resetPassword } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

// register 
router.post('/register',upload.single('avatar'),register)
// login
router.post('/login',login)
// profile
router.get('/profile',isLoggedIn,profile)
// logout
router.post('/logout',logout)
router.post('/forgot-password',forgotPasswordToken)
router.post('/reset-password',resetPassword)
router.post('/change-password',isLoggedIn,changePassword)

export default router ;