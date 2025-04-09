require("dotenv").config();
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Tesseract = require("tesseract.js");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const Chat = require("../models/Chat");
const SupportMessage = require("../models/SupportMessage");
const KYC = require("../models/KycApproval");
const flash = require("connect-flash");
const Religion = require("../models/Religion");
const MotherTongue = require("../models/MotherTongue");
const RestrictedWord = require("../models/RestrictedWord");
const City = require("../models/Cities");
const Height = require("../models/Height");
const KundaliMatch = require("../models/KundaliMatch");
const savePromoCodeUsage = require("../utils/savePromoCodeUsage");
const getCoordinates = require("../utils/getcodes");
const Country = require("../models/Country");
const Degree = require("../models/Degree");
const Plan = require("../models/Plan");
const SuccessStory = require("../models/SucessStories");
const PromoCode = require("../models/PromoCode");
const JobSector = require("../models/JobSector");
const pdfkit = require("pdfkit");
const fs = require("fs");
const sharp = require("sharp");
const { checkNudity }= require("../controllers/checkNudity");
const { compressImage } = require("../controllers/compressImage");
const {getShuffledUsers} = require("../controllers/getShuffledUsers");
const filterUsers = require("../controllers/filterdUser");
const path = require("path");
const router = express.Router();
const mongoose = require("mongoose");
const { Cashfree, CFEnvironment } = require("cashfree-pg");
const crypto = require("crypto");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const nodemailer = require("nodemailer");
const { sendWelcomeEmail } = require("../controllers/emailService");
const { sendPlanPurchaseEmail } = require("../controllers/emailService");
const { checkAndResetPlan } = require("../controllers/checkPlan");
const { isKYCExists } = require("../utils/isKyc");
const canSendMessage = require("../middleware/canSendMessage");
const SuccessStoryRequest = require("../models/SuccessStoryRequest");
const { request } = require("http");


const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "sandbox"
    ? "https://sandbox.cashfree.com/pg/orders"
    : "https://api.cashfree.com/pg/orders";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "A",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

const checkImageLimit = async (req, res, next) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      req.flash("error", "Unauthorized. Please log in.");
      return res.redirect("/");
    }

    if (currUser.images.length >= 5) {
      req.flash("error", "Maximum Upload Reached. Delete some to upload!");
      return res.redirect("/profile");
    }

    next(); // Proceed to multer upload
  } catch (err) {
    console.error("Error checking image limit:", err);
    req.flash("error", "Server error: " + err.message);
    return res.redirect("/profile");
  }
};



router.get("/get-cities", async (req, res) => {
  try {
    const stateName = req.query.state;

    if (!stateName) {
      return res.status(400).json({ error: "State name is required" });
    }

    const cities = await City.find({ state: stateName }).select("name -_id");

    if (cities.length === 0) {
      return res.status(404).json({ error: "No cities found for this state" });
    }

    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/support", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) return res.redirect("/");

    const messages = await SupportMessage.find({ user: currUser._id }).sort({ createdAt: 1 });
    const today = new Date();
today.setHours(0, 0, 0, 0); // Set time to start of the day

const messagesToday = await SupportMessage.countDocuments({
  user: currUser._id,
  createdAt: { $gte: today }, // Messages created today
});

<<<<<<< HEAD
    const userId = req.user.id; 
=======
const userId = req.user.id; 
>>>>>>> d914ebb0 (WIP: local changes before pulling from remote)

const existingRequest = await SuccessStoryRequest.findOne({ user: userId });

const srequest = !!existingRequest; 


    res.render("support", { currUser, messages, srequest , messagesToday});
  } catch (error) {
    console.error("❌ Error:", error.message);
    req.flash("error", "Server error: " + error.message);
    res.redirect("/");
  }
});


router.post("/support", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) return res.redirect("/");

    const canSend = await canSendMessage(currUser._id);
    if (!canSend) {
      req.flash("error", "You have reached your daily limit of 5 messages.");
      return res.redirect("/support");
    }

    const newMessage = new SupportMessage({
      user: currUser._id,
      message: req.body.message
    });

    await newMessage.save();

    req.flash("success", "Message sent to support.");
    res.redirect("/support");
  } catch (error) {
    console.error("❌ Error:", error.message);
    req.flash("error", "Server error: " + error.message);
    res.redirect("/support");
  }
});


router.get("/requestSuccessStory", async(req, res) => {
  try {
    const currUser = req.user;
    if(!currUser){
      return res.redirect("/");
    }

    res.render("requestSuccessStory", { currUser: req.user });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    req.flash("error", "Server error: " + error.message);
  }
  
});

// ✅ POST route - Handle success story request submission
router.post(
  "/requestSuccessStory",
  upload.single("image"),
  async (req, res) => {
    try {
      const currUser = req.user;

      if (!currUser) {
        req.flash("error", "You must be logged in to submit a success story.");
        return res.redirect("/");
      }

      if (!req.file) {
        req.flash("error", "Please upload an image.");
        return res.redirect("/requestSuccessStory");
      }

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "success_stories"
      });

      // Save story request to database
      const newStoryRequest = new SuccessStoryRequest({
        user: currUser._id,
        name: req.body.name,
        partnerName: req.body.partnerName,
        partnerPhone: req.body.partnerPhone,
        image: result.secure_url,
        quote: req.body.quote
      });

      await newStoryRequest.save();

      req.flash("success", "Your success story request has been submitted!");
      res.redirect("/support");
    } catch (error) {
      console.error("❌ Error:", error.message);
      req.flash("error", "Something went wrong. Please try again.");
      res.redirect("/requestSuccessStory");
    }
  }
);

const getRoomName = (id1, id2) => {
  return [id1, id2].sort().join("-");
};

const sendOTP = async (phone) => {
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN/${process.env.TWO_FACTOR_TEMPLATE_ID}`
    );

    if (response.data.Status === "Success") {
      console.log("✅ OTP sent successfully:", response.data);
      return response.data.Details; // This is the session ID needed for verification
    } else {
      console.log("❌ Failed to send OTP:", response.data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return null;
  }
};

const getChatList = async (currUserId) => {
  try {
    const chatList = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(currUserId) },
            { receiverId: new mongoose.Types.ObjectId(currUserId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(currUserId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          userId: "$userDetails._id",
          fullname: "$userDetails.fullname",
          lastMessage: 1,
          lastMessageTime: 1,
          image: {
            $ifNull: [
              { $arrayElemAt: ["$userDetails.images", 0] },
              "/images/profile.jpg",
            ],
          },
          lastSeenTime: "$userDetails.lastSeenTime",
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    // Calculate online status
    const currentTime = new Date();

    chatList.forEach((chat) => {
      if (chat.lastSeenTime) {
        const lastSeenTime = new Date(chat.lastSeenTime);

        // Calculate difference in minutes
        const timeDiff = (currentTime - lastSeenTime) / (1000 * 60);

        // If last seen within 15 minutes, user is online
        chat.online = timeDiff <= 15;
      } else {
        chat.online = false;
      }
    });

    return chatList;
  } catch (error) {
    console.error("Error fetching chat list:", error);
    return [];
  }
};

async function updateLastSeen(userId) {
  try {
    const now = new Date(); // Get current date and time

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { lastSeenTime: now }, // ✅ Store full Date object
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found");
      return null;
    }

    console.log("User last seen updated:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Error updating last seen time:", error);
  }
}

router.get("/", async (req, res) => {
  try {
    console.log("Current User:", req.user);

    if (req.user) {
      const currUser = req.user;
      updateLastSeen(currUser._id);
      checkAndResetPlan(currUser._id);
      const countries = await Country.find();
      const degrees = await Degree.find();
      const heights = await Height.find();
      const jobSectors = await JobSector.find();
      const motherTongues = await MotherTongue.find();
      const allLanguages = motherTongues.flatMap((region) =>
        region.languages.map((lang) => lang.name)
      );
      const religions = await Religion.find();
      const susers = await User.find({
        _id: { $ne: req.user._id }, // Exclude logged-in user
        motherTongue: { $exists: true, $ne: "" } // Ensure motherTongue is not empty
      });
      
      // Separate sponsored & non-sponsored users
      let sponsoredUsers = susers.filter(user => user.sponsorship?.isActive);
      let otherUsers = susers.filter(user => !user.sponsorship?.isActive);
      
      // Shuffle both lists
      sponsoredUsers = sponsoredUsers.sort(() => Math.random() - 0.5);
      otherUsers = otherUsers.sort(() => Math.random() - 0.5);
      
      // Combine sponsored users first, then shuffled non-sponsored users
      const users = [...sponsoredUsers, ...otherUsers];
      
      
      


      res.render("home", {
        currUser,
        users,
        countries,
        degrees,
        heights,
        jobSectors,
        motherTongues,
        allLanguages,
        religions,
      });
    } else {
      res.render("webdetails", { error: null });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/filter-choice", async(req, res)=>{
  try {
    const currUser= req.user;
    if(!currUser){
      return res.redirect("/");
    }
    const countries = await Country.find();
      const degrees = await Degree.find();
      const heights = await Height.find();
      const jobSectors = await JobSector.find();
      const motherTongues = await MotherTongue.find();
      const allLanguages = motherTongues.flatMap((region) =>
        region.languages.map((lang) => lang.name)
      );
      const religions = await Religion.find();

    return res.render("filter-choice", {currUser,
      countries,
      degrees,
      heights,
      jobSectors,
      motherTongues,
      allLanguages,
      religions});
  } catch (error) {
    console.log(error);
  }

});
router.post("/filter", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      return res.redirect("/");
    }

  const users = await filterUsers(req);

    return res.render("filter", {users, currUser})
    
  } catch (error) {
    console.error("Error in filter route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login-page", async(req, res)=>{

  try {
    return res.render("otp", { error: null });
  } catch (error) {
    console.error("Error fetching :", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }

});


router.get("/my-offers", async (req, res) => {
  try {

    const user = await User.findById(req.user._id);
   
    
    if(!user){
      res.redirect("/");
    }
    res.render("offers", { promoCodes: user.promoCodes });
  } catch (error) {
    console.error("Error loading offers:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Assume Chat is already imported
router.get("/chat/:id", async (req, res) => {
  try {
    // Extract partner's ID and current user (req.user)
    const partnerUserId = req.params.id;
    const currUser = req.user;
    if (currUser.plan && currUser.plan.name === "Free") {
      const messagesCount = await Chat.countDocuments({ senderId: currUser._id });
      
      if (messagesCount >= 5) {
          return res.redirect("/Upgrade-Membership");
      }
  }
    const user = await User.findById(partnerUserId);
    // Query for all chat messages between currUser and partnerUserId
    const messages = await Chat.find({
      $or: [
        { senderId: currUser._id, receiverId: partnerUserId },
        { senderId: partnerUserId, receiverId: currUser._id },
      ],
    }).sort({ createdAt: 1 }); // sort ascending by created time

    // Render chat page, passing currUser, partnerUserId, and messages
    res.render("chat", { currUser, user, partnerUserId, messages });
  } catch (err) {
    console.error("Error in /chat route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/chats", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/");
    }

    const currUser = req.user;
    const chats = await getChatList(currUser.id); // ✅ Await the function call

    res.render("chats", { chats });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/edit-profile", async(req, res)=>{
  try {
    const currUser=req.user;
    if(!req.user){
      return res.redirect("/");
    }
      
      const countries = await Country.find();
      const degrees = await Degree.find();
      const heights = await Height.find();
      const jobSectors = await JobSector.find();
      const motherTongues = await MotherTongue.find();
      const allLanguages = motherTongues.flatMap((region) =>
        region.languages.map((lang) => lang.name)
      );
      const religions = await Religion.find();
      const users = await User.find({
        _id: { $ne: req.user._id },
        motherTongue: { $exists: true, $ne: "" },
      });

    res.render("eddit-profile", {currUser,
      users,
      countries,
      degrees,
      heights,
      jobSectors,
      motherTongues,
      allLanguages,
      religions,});
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }

});


router.post("/eddit-profile", async(req, res)=>{
  try {
    const currUser =req.user;
    if(!currUser){
      return res.redirect("/");
    }

    let details = req.body;

    
    details.brothers = parseInt(details.brothers, 10) || 0;
    details.marriedBrothers = parseInt(details.marriedBrothers, 10) || 0;
    details.sisters = parseInt(details.sisters, 10) || 0;
    details.marriedSisters = parseInt(details.marriedSisters, 10) || 0;


    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...details
      },
      { new: true } 
    );

    res.redirect("/profile")

  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})

router.get("/Upgrade-Membership", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      return res.redirect("/");
    }
    const promoCode = await PromoCode.find();
    res.render("upgrade", { currUser, promoCode });
  } catch (error) {
    console.error("Error fetching upgrade page:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/api/promocode/:code", async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({ code: req.params.code });
    if (!promoCode)
      return res.status(404).json({ message: "Invalid promo code" });

    res.json({ discount: promoCode.discount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/download-receipt", async (req, res) => {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(404).send("Order not found");
  }

  try {
    const response = await fetch(
      `https://sandbox.cashfree.com/pg/orders/${order_id}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2021-05-21",
        },
      }
    );

    const order = await response.json();

    if (order.order_status === "PAID") {
      const pdf = new pdfkit({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Receipt_${order_id}.pdf`
      );

      pdf.pipe(res);

      // ✅ **Company Name & Invoice Title**
      pdf
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("IndianWife.in", { align: "center" });
      pdf.moveDown(0.5);
      pdf
        .fontSize(14)
        .text("Matrimony Services Provider.", { align: "center" });
      pdf.moveDown();
      pdf
        .fontSize(16)
        .text("Payment Invoice", { align: "center", underline: true });
      pdf.moveDown(1.5);

      // ✅ **Table Style Layout**
      pdf.fontSize(14).font("Helvetica-Bold").text("Order Details");
      pdf.moveDown(0.5);
      pdf.font("Helvetica").fontSize(12);
      pdf.text(`Order ID       : ${order.order_id}`);
      pdf.text(
        `Date           : ${new Date(order.created_at).toLocaleDateString()}`
      );
      pdf.moveDown();

      pdf.fontSize(14).font("Helvetica-Bold").text("Customer Details");
      pdf.moveDown(0.5);
      pdf.font("Helvetica").fontSize(12);
      pdf.text(`Name           : ${order.customer_details.customer_name}`);
      pdf.text(`Email          : ${order.customer_details.customer_email}`);
      pdf.text(`Phone          : ${order.customer_details.customer_phone}`);
      pdf.moveDown();

      pdf.fontSize(14).font("Helvetica-Bold").text("Plan Details");
      pdf.moveDown(0.5);
      pdf.font("Helvetica").fontSize(12);
      pdf.text(`Plan Name      : ${order.order_note}`);
      pdf.text(`Amount Paid    : Rs${order.order_amount}`);
      pdf.moveDown(1.5);

      // ✅ **Payment Confirmation**
      pdf
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("✅ Payment Status: PAID", { align: "center" });
      pdf.moveDown(1);

      // ✅ **Thank You & Support Info**
      pdf
        .fontSize(12)
        .text(
          "Thank you for choosing IndianWife.in for your matrimonial needs!",
          {
            align: "center",
          }
        );
      pdf.moveDown(0.5);
      pdf.text("For any queries, contact indianwife0001@gmail.com", {
        align: "center",
      });

      pdf.end();
    } else {
      return res.status(400).send("Order is not paid or invalid.");
    }
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).send("Internal Server Error");
  }
});





router.post("/payment", async (req, res) => {
  try {
    const { name, email, phone, amount, plan, promocode} = req.body;
    
    const userId = req.user;
    const promoCode = promocode;
    const planName = plan;

   savePromoCodeUsage(promoCode, userId, planName);


    const orderData = {
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `USER_${Date.now()}`,
        customer_phone: phone,
        customer_email: email,
        customer_name: name
      },
      order_note: plan,
      order_meta: {
        return_url: `http://localhost:5000/payment/status?order_id={order_id}`, // Redirect URL after payment
        notify_url: `http://localhost:5000/payment/webhook`, // Webhook to get real-time updates
        promo_code: promocode
      },
    };

    // Call Cashfree API to create an order
    const response = await fetch(CASHFREE_BASE_URL, {
      method: "POST",
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2021-05-21",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (data.payment_link) {
      res.redirect(data.payment_link); // Redirect user to Cashfree Payment Page
    } else {
      res.send("Error creating payment link. Please try again.");
    }
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).send("Error processing payment");
  }
});







// ✅ Success/Failure Page Handling
router.get("/payment/status", async (req, res) => {
  const { order_id } = req.query;

  if (!order_id) {
    return res.send("Invalid request. Order ID missing.");
  }

  try {
    const response = await fetch(
      `https://sandbox.cashfree.com/pg/orders/${order_id}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2021-05-21",
        },
      }
    );

    const data = await response.json();

    if (data.order_status.toUpperCase() === "PAID") {
      const email = data.customer_details?.customer_email;
      const name = data.customer_details?.customer_name;
      const planName = data.order_note;
      const amountPaid = data.order_amount;

      if (!email || !name || !planName) {
        console.error("Missing email, name, or plan name:", {
          email,
          name,
          planName,
          order_id,
          amountPaid,
        });
        return res.status(400).json({ message: "Invalid data received" });
      }
      console.log("Sending email to:", email, "Plan:", planName);
      try {
        await sendPlanPurchaseEmail(
          email,
          name,
          planName,
          order_id,
          amountPaid
        );
        console.log("Email sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }

      const user = req.user;
      if (!user) return res.status(404).json({ message: "User not found" });

      const plan = await Plan.findOne({ name: planName });
      if (!plan) return res.status(404).json({ message: "Plan not found" });

      // Set expiry date
      let expiryDate = null;
      if (plan.durationInDays !== Infinity) {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plan.durationInDays);
      }

      

      if (["Sponsorship249", "Sponsorship999", "Sponsorship1599"].includes(plan.name)) {
        user.sponsorship.isActive=true;
        user.sponsorship.expiryDate=expiryDate;
        await user.save();
        return res.render("payment-success", { order: data });
    }
    

      // Update user plan
      user.plan = {
        name: plan.name,
        views: plan.features.views,
        chats: plan.features.chats,
        contacts: plan.features.contacts,
        intrests: plan.features.intrests,
        shortlis: plan.features.shortlis,
        validUntil: expiryDate,
      };

      await user.save();
      console.log("plan upgraded");

      res.render("payment-success", { order: data });
    } else {
      res.render("payment-failed", { order: data }); // Render failure page
    }
  } catch (error) {
    console.error("Payment Status Error:", error);
    res.send("Error fetching payment status.");
  }
});

// ✅ Webhook to receive real-time payment updates
router.post("/payment/webhook", async (req, res) => {
  console.log("Cashfree Webhook Data:", req.body);

  if (req.body.order_status === "PAID") {
    console.log("✅ Payment Successful:", req.body);
  } else {
    console.log("❌ Payment Failed:", req.body);
  }

  res.sendStatus(200); // Respond to Cashfree
});

router.get("/profile", async (req, res) => {
  try {
    const currUser = req.user;
    const user = currUser;
    if (!currUser) {
      res.redirect("/");
    }
    res.render("profile", { user });
  } catch (error) {}
});
router.post(
  "/upload-photo",
  checkImageLimit,
  upload.single("image"),
  async (req, res) => {
    try {
      const currUser = req.user;
      if (!currUser) return res.redirect("/");

      if (!req.file) {
        req.flash("error", "No file uploaded or maximum upload limit reached.");
        return res.redirect("/profile");
      }

      // Upload image to Cloudinary with compression
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "A",
        transformation: [{ quality: "auto:eco" }, { fetch_format: "auto" }]
      });

      // Log important details
      console.log("✅ File uploaded to Cloudinary");
      console.log("Cloudinary Secure URL:", result.secure_url);
      console.log("Cloudinary Public ID:", result.public_id);

      const imageUrl = result.secure_url; // Get the correct URL

      // Check for nudity
      const isNSFW = await checkNudity(imageUrl);
      if (isNSFW) {
        await cloudinary.uploader.destroy(result.public_id); // Delete NSFW image
        req.flash("error", "This image contains nudity. Please upload another one!");
        return res.redirect("/profile");
      }

      // Save image URL to user profile
      currUser.images.push(imageUrl);
      await currUser.save();

      req.flash("success", "Image uploaded successfully!");
      res.redirect("/profile");

    } catch (err) {
      console.error("❌ Error:", err.message);
      req.flash("error", "Server error: " + err.message);
      res.redirect("/profile");
    }
  }
);

router.get("/profile-verification", async(req, res)=>{
  try {
    const currUser = req.user;
    if(!currUser){
          res.redirect("/");
    }
    const approval = await isKYCExists(currUser._id);
    console.log(approval);
    res.render("kyc", {currUser, approval});
    
  } catch (error) {
    console.error("❌ Error:", err.message);
    req.flash("error", "Server error: " + err.message);
    res.redirect("/");
  }

});



router.post(
  "/profile-verification",
  upload.single("aadhaar"),
  async (req, res) => {
    try {
      const currUser = req.user;
      if (!currUser) return res.redirect("/");

      if (!req.file) {
        req.flash("error", "No file uploaded.");
        return res.redirect("/kyc");
      }

      // Upload Aadhaar image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "A"
      });

      const imageUrl = result.secure_url;

      // Extract text using OCR
      console.log("🔍 Extracting text from Aadhaar...");
      const { data } = await Tesseract.recognize(imageUrl, "eng");

      const extractedText = data.text.toLowerCase();
      console.log("Extracted Text:", extractedText);

      // Compare extracted name with user full name
      const userFullName = currUser.fullname.toLowerCase(); // Assuming 'fullName' exists in user model

      if (extractedText.includes(userFullName)) {
        console.log("✅ Aadhaar name matches user name!");
        currUser.kyc = true;
        currUser.adhar = imageUrl; 
        await currUser.save();

        const newKYC = new KYC({
          user: currUser._id,
          imageUrl: imageUrl,
          approval: true
        });
  
        await newKYC.save();

        req.flash("error", "KYC approved successfully!");
       return res.redirect("/profile-verification");

      } else {
        const newKYC = new KYC({
          user: currUser._id,
          imageUrl: imageUrl
        });
  
        await newKYC.save();
        console.log("❌ Aadhaar name does NOT match!");
        req.flash("error", "KYC Pending: Name mismatch.");
        return res.redirect("/profile-verification");
      }
      res.redirect("/profile-verification");
    } catch (err) {
      console.error("❌ Error:", err.message);
      req.flash("error", "Server error: " + err.message);
      res.redirect("/profile-verification");
    }
  }
);


// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const phone = req.body.phone;

    if (!phone) {
      return res.render("otp", { error: "Phone number is required" });
    }

    let user = await User.findOne({ phone });

    if (user) {
      console.log(`Phone already registered: ${phone}`);
      req.flash("error", "Phone number already exists. Please log in.");
      return res.redirect("/"); // Prevents further execution
    }

    console.log(`Sending OTP to: ${phone}`);
    const sessionId = await sendOTP(phone);

    if (sessionId) {
      return res.render("verify", { sessionId, phone, error: null });
    } else {
      return res.render("otp", { error: "Failed to send OTP. Try again." });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { sessionId, otp, phone } = req.body;

  if (!otp || !sessionId) {
    return res.render("verify", { sessionId, phone, error: "OTP is required" });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (response.data.Status === "Success") {
      return res.render("success", { phone });
    } else {
      return res.render("verify", {
        sessionId,
        phone,
        error: "Invalid OTP. Try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.render("verify", {
      sessionId,
      phone,
      error: "Error verifying OTP.",
    });
  }
});

const fixDuplicateError = async () => {
  try {
    const db = mongoose.connection;
    // Drop the unique index on 'phone'
    await db
      .collection("users")
      .dropIndex("mobileNumber_1")
      .catch((err) => {
        console.log("⚠️ Index not found or already removed:", err.message);
      });

    console.log("✅ Unique index on 'phone' removed!");
    process.exit();
  } catch (error) {
    console.error("❌ Error fixing index:", error);
    process.exit(1);
  }
};






router.post("/register", async (req, res) => {
  const { fullname, email, address, phone, password } = req.body;
  try {
    let user = await User.findOne({ phone });
    if (user) {
      req.flash("error", "Phone number already exists. Please log in");
      return res.redirect("/");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isVerified = true;

    user = new User({
      fullname,
      email,
      address,
      phone,
      password: hashedPassword,
      isVerified,
    });
    await user.save();
    req.flash("error", "Account Created Login Account.");
    const userEmail = email;
    const userName = fullname;
    sendWelcomeEmail(userEmail, userName);
    res.redirect("/");
  } catch (err) {
    console.error("❌ Error in /register route:", err); // Log the actual error
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/full-details", async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.user) {
      return res.status(401).send("Please login first");
    }

    // Get the additional details from req.body
    let details = req.body;
    const {City, state} = req.body;

    if (!City || !state) {
      return res.status(400).json({ message: "City and state are required." });
    }

    let coordinates = { latitude: 0, longitude: 0 };
    try {
      coordinates = await getCoordinates(City, state);
    } catch (error) {
      console.warn("Could not fetch coordinates:", error.message);
    }

    details.casteNoBar = details.casteNoBar === "on";
    details.brothers = parseInt(details.brothers, 10) || 0;
    details.marriedBrothers = parseInt(details.marriedBrothers, 10) || 0;
    details.sisters = parseInt(details.sisters, 10) || 0;
    details.marriedSisters = parseInt(details.marriedSisters, 10) || 0;

    // Compute age from day, month, and year
    const day = parseInt(details.day, 10);
    const month = parseInt(details.month, 10);
    const year = parseInt(details.year, 10);
    const birthDate = new Date(year, month - 1, day);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Update the current user's details (including computed age)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...details,
        age: age,
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
      },
      { new: true } // Return the updated document
    );

    res.redirect("/");
  } catch (err) {
    console.error("❌ Error in /full-details route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




router.get("/profile/:userId", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (currUser.plan.views <= 0) {
      req.flash("error", "Upgrade plan to view more profiles");
      return res.redirect("/Upgrade-Membership");
    }

    // Deduct 1 from available views
    currUser.plan.views -= 1;

    currUser.markModified("plan");
    // Save the updated user
    await currUser.save();

    const { userId } = req.params;

    // Find user by ID and populate interests and super interests
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.views = user.views + 1;
    await user.save();
    res.render("profiles", { user, currUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});


router.get("/privacy-policy", async(req, res)=>{
  try {
    res.render("privacy-policy");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
})
router.get("/about-us", async(req, res)=>{
  try {
    res.render("about-us");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
})
router.get("/success-stories", async(req, res)=>{
  try {
    const successStories= await SuccessStory.find();
    const reversedSuccessStories = successStories.reverse();
    res.render("sucess-story", {reversedSuccessStories});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
})

router.post("/deduct-contact/:userId", async (req, res) => {
  try {
      // Ensure current user is available
      if (!req.user) {
          return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const currUser = await User.findById(req.user._id); // Get logged-in user
      const user = await User.findById(req.params.userId); // Get the user whose contact is being viewed

      if (!currUser || !user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Check if user is on Free Plan
      if (currUser.plan.name === "Free") {
          return res.json({ success: false, message: "Upgrade Plan to View Contact", redirect: "/upgrade-membership" });
      }

      // Check if user has contacts left
      if (currUser.plan.contacts <= 0) {
          return res.json({ success: false, message: "No contacts left. Upgrade Plan to View More Contacts", redirect: "/upgrade-membership" });
      }

      // Add viewed user to phonebook if not already added
      if (!currUser.phonebook.includes(user._id)) {
          currUser.phonebook.push(user._id);
          currUser.plan.contacts -= 1;
          currUser.markModified("plan");
      }

      
      await currUser.save();

      res.json({
          success: true,
          message: "Contact details accessed successfully!",
          email: user.email || "Not Available",
          phone: user.phone || "Not Available",
          address: user.address || "Not Available"
      });

  } catch (error) {
      console.error("Error in deduct-contact route:", error);
      res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

router.get("/phonebook", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/");
    }

    const currUserId = req.user._id;

    // Fetch users who received super interest from the current user
    const interestedUsers = await User.find({ _id: { $in: req.user.superInterests } }).lean();

    // Fetch users who sent super interest to the current user
    const receivedSuperInterests = await User.find({ superInterests: { $in: [currUserId] } }).lean();

    // Fetch contacts from the phonebook
    const phonebookUsers = await User.find({ _id: { $in: req.user.phonebook } }).lean();

    res.render("phonebook", { interestedUsers, receivedSuperInterests, phonebookUsers });
  } catch (error) {
    console.error("Error fetching phonebook:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/likes", async (req, res) => {
  try {
      const { userId } = req.body;
      if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      const currUserId = req.user._id.toString(); // Ensure it's a string for comparison
      const index = user.interests.findIndex(id => id.toString() === currUserId);

      if (index === -1) {
          // Add interest if not present
          user.interests.push(req.user._id);
          await user.save();
          return res.json({ success: true, action: "added", message: "Interest added" });
      } else {
          // Remove interest if already present
          user.interests.splice(index, 1);
          await user.save();
          return res.json({ success: true, action: "removed", message: "Interest removed" });
      }
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/intrest", async (req, res) => {
  try {
      const { userId } = req.body;
      if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      const currUserId = req.user._id.toString(); // Ensure it's a string for comparison
      const index = user.superInterests.findIndex(id => id.toString() === currUserId);

      if (index === -1) {
          // Add interest if not present
          user.superInterests.push(req.user._id);
          await user.save();
          return res.json({ success: true, action: "added", message: "Interest added" });
      } else {
          // Remove interest if already present
          user.superInterests.splice(index, 1);
          await user.save();
          return res.json({ success: true, action: "removed", message: "Interest removed" });
      }
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/shortlist", async (req, res) => {
  try {
      const { userId } = req.body;
      if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }
       const currUser = req.user;
       if (!currUser.plan || currUser.plan.name === "Free") {
        return res.json({ success: false, message: "UpgradeMembership" });
    }
    
      const currUserId = currUser._id.toString(); // Ensure it's a string for comparison
      const index = currUser.shortlists.findIndex(id => id.toString() === userId);

      if (index === -1) {
        if (!currUser.plan || currUser.plan.shortlis <= 0) {
            return res.json({ success: false, message: "UpgradeMembership" });
        }
    
        // Add interest if not present
        currUser.shortlists.push(userId);
        currUser.plan.shortlis -= 1; // Reduce available shortlist count
    
        await currUser.save();
        return res.json({ success: true, action: "added", message: "Interest added" });
    }else {
          // Remove interest if already present
          currUser.shortlists.splice(index, 1);
          
          await currUser.save();
          return res.json({ success: true, action: "removed", message: "Interest removed" });
      }
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/shortlisted-profile", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      return res.redirect("/");
    }

    // Fetch all users whose `_id` is in `currUser.shortlists`
    const shortlistedProfiles = await User.find({ _id: { $in: currUser.shortlists } });

    res.render("shortlist", { shortlistedProfiles });

  } catch (error) {
    console.error("Error fetching shortlisted profiles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/password-change", async(req, res)=>{

  try {
    if(req.user){
      res.redirect("/");
    }

    res.render("password-change");
    
  } catch (error) {
    console.error("Error fetching shortlisted profiles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }

});


router.post("/pass-verify", async(req, res) => {
  try {
    if (req.user) {
      return res.redirect("/");
    }

    const { phone, password1 } = req.body;
    
    // Find user with the provided phone number
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const sessionId = await sendOTP(phone);

    if (sessionId) {
      return res.render("pass-otp-verify", {password1, sessionId, phone, error: null });
    } else {
      return res.redirect("/change-password");
    }
    
  } catch (error) {
    console.error("Error fetching user for password verification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/verify-password-otp", async(req, res)=>{

  const {password, sessionId, otp, phone } = req.body;
  const password1 = password;
  if (!otp || !sessionId) {
    return res.render("verify", { sessionId, phone, error: "OTP is required" });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (response.data.Status === "Success") {
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.findOne({ phone });
      user.password=hashedPassword;
      await user.save();
      req.flash("error", "Password changed successfully! Please log in to continue.");
      res.redirect("/");

    } else {
      return res.render("pass-verify", {
        password1,
        sessionId,
        phone,
        error: "Invalid OTP. Try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.render("pass-verify", {
      password1,
      sessionId,
      phone,
      error: "Error verifying OTP.",
    });
  }

});
router.post("/block", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/");
    }

    const { id } = req.body; // ID of the user to block/unblock
    const currUser = await User.findById(req.user.id); // Get current user
    const user = await User.findById(id); // Get the user to be blocked

    if (!currUser || !user) {
      return res.redirect("/");
    }

    // Check if user is already blocked
    const isBlocked = currUser.blockedUsers.includes(id);

    if (isBlocked) {
      // Unblock the user (Remove from blockedUsers array)
      currUser.blockedUsers = currUser.blockedUsers.filter(userId => userId.toString() !== id);
    } else {
      // Block the user (Add to blockedUsers array)
      currUser.blockedUsers.push(id);
    }

    // Save the updated current user data
    await currUser.save();

    res.json({ 
      success: true, 
      message: isBlocked ? "User unblocked successfully" : "User blocked successfully" 
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});




router.post("/request-kundali-match", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/");
    }
    if (req.user.plan.contacts === 0) {  
      return res.json({ success: false, message: "Upgrade plane to send request!" });
  }
  

    const { matchWithId } = req.body;
    const requesterId = req.user.id;

    console.log("Requester ID:", requesterId);
    console.log("Match With ID:", matchWithId);

    // Check if IDs exist
    if (!requesterId || !matchWithId) {
      return res.json({ success: false, message: "Missing user IDs" });
    }

    // Fetch user names from the database
    const requester = await User.findById(requesterId);
    const matchWith = await User.findById(matchWithId);

    console.log("Requester Data:", requester);
    console.log("Match With Data:", matchWith);

    if (!requester || !matchWith) {
      return res.json({ success: false, message: "User not found" });
    }


    const existingRequest = await KundaliMatch.findOne({
      $or: [
        { requesterId, matchWithId },
        { requesterId: matchWithId, matchWithId: requesterId }
      ]
    });

    if (existingRequest) {
      return res.json({ success: false, message: `Kundali match request already sent by ${requester.fullname} or ${matchWith.fullname}!` });
    }


    const requesterName=requester.fullname;
    const matchWithName=matchWith.fullname;


    const newRequest = new KundaliMatch({
      requesterId,
      requesterName,
      matchWithId,
      matchWithName,
    });

    await newRequest.save();
    res.json({ success: true, message: "Kundali match request sent successfully!" });

  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false, message: "Error sending request", error: error.message });
  }
});

router.get("/Kundali-Matching", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/");
    }

    const requesterId = req.user.id;

    // Fetch all match requests where requesterId matches the logged-in user
    const matches = await KundaliMatch.find({ requesterId }).populate("matchWithId");

    res.render("kundali-matching", { matches, user: req.user }); // Pass matches data to the frontend
  } catch (error) {
    console.error("Error fetching Kundali matches:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/plan", async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).send("User not found");
      }
        
      const planDetails = {
          planName: user.plan.name,
          viewsRemaining: user.plan.isUnlimited ? "Unlimited" : user.plan.views,
          chatsRemaining: user.plan.isUnlimited ? "Unlimited" : user.plan.chats,
          contactsRemaining: user.plan.isUnlimited ? "Unlimited" : user.plan.contacts,
          intrestsRemaining: user.plan.isUnlimited ? "Unlimited"  : user.plan.intrests,
          shortlistsRemaining: user.plan.isUnlimited ? "Unlimited" : user.plan.shortlis,
          sponsorship: user.sponsorship.isActive ? "Active" : "Not Active",
          validUntil: user.plan.validUntil ? user.plan.validUntil.toISOString().split("T")[0] : "Lifetime (Free Plan)"
      };

      res.render("plan", { plan: planDetails });
  } catch (error) {
      res.status(500).send("Server Error");
  }
});


router.post("/toggle-interest", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const index = user.interests.indexOf(req.user._id);
    if (index === -1) {
      // Add interest if not present
      user.interests.push(req.user._id);
      await user.save();
      return res.json({
        success: true,
        action: "added",
        message: "Interest added",
      });
    } else {
      // Remove interest if already present
      user.interests.splice(index, 1);
      await user.save();
      return res.json({
        success: true,
        action: "removed",
        message: "Interest removed",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/toggle-super-interest", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const index = user.superInterests.indexOf(req.user._id);
    if (index === -1) {
      // Add super interest
      user.superInterests.push(req.user._id);
      await user.save();
      return res.json({
        success: true,
        action: "added",
        message: "Super Interest added",
      });
    } else {
      // Remove super interest
      user.superInterests.splice(index, 1);
      await user.save();
      return res.json({
        success: true,
        action: "removed",
        message: "Super Interest removed",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/delete-img", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      req.flash("error", "Unauthorized. Please log in.");
      return res.redirect("/profile");
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
      req.flash("error", "Invalid request.");
      return res.redirect("/profile");
    }

    // ✅ Extract `publicId` correctly
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];

    console.log("Deleting Image with Public ID:", publicId);

    // ✅ Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary Deletion Result:", result);

    if (result.result !== "ok") {
      req.flash("error", "Failed to delete image from Cloudinary.");
      return res.redirect("/profile");
    }

    // ✅ Remove image from `currUser.images` array
    currUser.images = currUser.images.filter((img) => img !== imageUrl);
    await currUser.save(); // Save updated user data

    console.log("Image removed from user data.");

    req.flash("success", "Image deleted successfully.");
    res.redirect("/profile");
  } catch (error) {
    console.error("Server error:", error);
    req.flash("error", "Server error: " + error.message);
    res.redirect("/profile");
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      req.flash("error", "Server error. Please try again.");
      return res.redirect("/");
    }
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login failed:", err);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/");
      }

      res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.redirect("/");
  });
});

module.exports = router;
