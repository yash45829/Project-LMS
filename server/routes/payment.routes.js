import { Router } from 'express';

const router = Router() ;

router
.route("/razorpay-key")
.get(razorpayKey)

router
.route("/subscribe")
.post(buySubscription)

router
.route("/verify")
.post(verifySubscription)

router
.route("unsubscribe")
.post(cancelSubscription)

router
.route("/")
.get(allpayments)

export default router;