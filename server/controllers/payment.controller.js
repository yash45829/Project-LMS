import User from "../models/user.model";
import { razorpay } from "../server.js";
import Payment from "../models/payment.model";

// RAZORPAY KEY
const razorpayKey = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "rajarpay key",
      key: process.env.PAYMENT_KEY_ID,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// BUY SUBSCRIPTION
const buySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById({ id });

    if (!user) {
      res.status(500).send(" you are not logged in");
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.PAYMENT_PLAN_ID,
      customer_notify: 1,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();
    res.status(200).json({
      success: true,
      message: "rajarpay key",
      subscription_id: subscription.id,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// VERIFY SUBSCRIPTION
const verifySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { razorpay_payment_id, signature, razorpay_subscription_id } =
      req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(500).send(" you are not logged in");
    }

    const subscriptionid = user.subscription.id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionid}`)
      .digest("hex");

    if (generatedSignature !== signature) {
      res.status(500).send("subscription not verified");
    }

    await Payment.create({
      razorpay_payment_id,
      signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";

    await user.save();

    res.status(200).json({
      success: true,
      messsage: "subscription verified",
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// CANCEL SUBSCRIPTION
const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      res.status(500).send(" you are not logged in");
    }

    if (user.role !== "ADMIN") {
      res.status(500).send(" you are not admin boy");
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

export {
  razorpayKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allpayments,
};
