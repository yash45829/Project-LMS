import { Router } from "express";

const router = Router();

import { login, logout, profile, register } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

// register 
router.post('/register',register)
// login
router.post('/login',login)
// profile
router.get('/profile',isLoggedIn,profile)
// logout
router.post('/logout',logout)

export default router ;