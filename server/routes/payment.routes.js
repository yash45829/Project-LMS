import { Router } from 'express';
import { autharizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import { 
    allPayments,
    buySubscription,
    cancelSubscription,
    razorpayKey, 
    verifySubscription 
} 
from '../controllers/payment.controller.js';

const router = Router() ;

router
.route("/razorpay-key")
.get(
    isLoggedIn,
    razorpayKey)

router
.route("/subscribe")
.post(
    isLoggedIn,
    buySubscription)

router
.route("/verify")
.post(
    isLoggedIn,
    verifySubscription)

router
.route("unsubscribe")
.post(
    isLoggedIn,
    cancelSubscription)

router
.route("/")
.get(
    isLoggedIn,
    autharizedRoles('ADMIN'),
    allPayments)

export default router;