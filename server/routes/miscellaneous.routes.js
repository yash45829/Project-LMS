import { Router } from 'express';
import {
  contactUs, userStats
} from '../controllers/miscellaneous.controller.js';
import { autharizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

// for contact us form 
router.post('/contact',contactUs);
router
.route('/admin/stats/user')
.get(isLoggedIn,
  autharizedRoles('ADMIN'),
  userStats);

export default router;