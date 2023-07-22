import { Router } from "express";

const router = Router();
import { login, logout, profile, register } from "../controllers/user.controller";

// register 
router.post('/register',register)
// login
router.post('/login',login)
// profile
router.get('/profile',profile)
// logout
router.post('/logout',logout)

export default router ;