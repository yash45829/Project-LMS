import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import Payment from "../models/payment.model.js";
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// RAZORPAY KEY
const razorpayKey = async (req, res, next) => {
  try {

    res.status(200).json({
      success: true,
      message: "razorpay key",
      key: process.env.PAYMENT_KEY_ID,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// BUY SUBSCRIPTION
const buySubscription = async (req, res, next) => {
  try {
    const id  = await req.user.id;
    const user = await User.findById( id );

    if (!user) {
     return res.status(500).send(" you are not logged in");
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.PAYMENT_PLAN_ID,
      customer_notify: 1,
      total_count: 12,
    });

   if(!subscription){
    return res.status(500).send(" failed in creating subscription");

   }
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();
    return  res.status(200).json({
      success: true,
      message: "rajarpay key",
      subscription_id: subscription.id,
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

// VERIFY SUBSCRIPTION
const verifySubscription = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { razorpay_payment_id,razorpay_subscription_id,razorpay_signature } =
     await req.body;
    const user = await User.findById(id);


    if (!user) {
     return res.status(500).send(" you are not logged in");
    }

    const subscriptionid =await user.subscription.id;

    const generatedSignature = await crypto
      .createHmac('sha256', process.env.PAYMENT_KEY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionid}`)
      .digest('hex');


    if (generatedSignature !== razorpay_signature) {
     return  res.status(500).send("subscription not verified");
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";

    await user.save();

    return res.status({
      success: true,
      messsage: "subscription verified",
    });
  } catch (e) {
     return res.status(500).send(e.message);
  }
};

// CANCEL SUBSCRIPTION
const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
     return  res.status(500).send(" you are not logged in");
    }

    if (user.role !== "ADMIN") {
     return  res.status(500).send(" you are not admin boy");
    }

    const subscriptionid = user.subscription.id;

    const subscription = await razorpay.subscriptions.cancel(subscriptionid);

    user.subscription.status = subscription.status;
    await user.save();
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// ALL PAYMENTS
const allpayments = async (req, res, next) => {
  try {
    const { count } = req.query;

    const subscriptions = await razorpay.subscriptions.all({
      count: count || 10,
    });

    res.status(200).json({
      success: true,
      message: "all subscriptions",
      subscriptions,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export  {
  razorpayKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allpayments,
};
