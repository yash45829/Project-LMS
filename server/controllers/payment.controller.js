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
    const id = await req.user.id;
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

    return res.status(200).send({
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
    const { id } =await  req.user;
    const user = await User.findById(id);

    if (!user) {
     return  res.status(500).send(" you are not logged in");
    }

    if (user.role == "ADMIN") {
     return  res.status(500).send(" you are admin boy");
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
  const allPayments = async (req, res, _next) => {
  const { count  } = req.query;

  const allPayments = await razorpay.subscriptions.all({
  count: count ? count : 10,
  })
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const finalMonths = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  const monthlyWisePayments = allPayments.items.map((payment) => {
    const monthsInNumbers = new Date(payment.start_at * 1000);

    return monthNames[monthsInNumbers.getMonth()];
  });

  monthlyWisePayments.map((month) => {
    Object.keys(finalMonths).forEach((objMonth) => {
      if (month === objMonth) {
        finalMonths[month] += 1;
      }
    });
  });

  // const monthlySalesRecord = [];

  // Object.keys(finalMonths).forEach((monthName) => {
  //   monthlySalesRecord.push(finalMonths[monthName]);
  // });

  res.status(200).json({
    success: true,
    message: 'All payments',
    allPayments,
    finalMonths,
  });
};


export  {
  razorpayKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
};
