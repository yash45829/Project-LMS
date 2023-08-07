import { Router } from 'express';
import { autharizedRoles, isLoggedIn } from '../middlewares/auth.middleware';

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
    allpayments)

export default router;