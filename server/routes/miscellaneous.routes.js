import { Router } from 'express';
import {
  contactUs
} from '../controllers/miscellaneous.controller.js';

const router = Router();

// for contact us form 
router.post('/contact',contactUs);

export default router;