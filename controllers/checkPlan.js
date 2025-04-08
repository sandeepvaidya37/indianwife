const User = require("../models/User");


const checkAndResetPlan = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    // If the plan is unlimited or has no expiry, do nothing
    if (user.plan.isUnlimited || !user.plan.validUntil) {
      return { success: true, message: "Plan is still valid" };
    }

    // Check if the plan is expired
    const currentDate = new Date();
    if (currentDate > user.plan.validUntil) {
      // Reset to Free plan
      user.plan = {
        name: "Free",
        views: 5,
        chats: 5,
        contacts: 0,
        isUnlimited: false,
        validUntil: null
      };
      await user.save();
      return { success: true, message: "Plan expired, reset to Free plan" };
    }

    return { success: true, message: "Plan is still valid" };

  } catch (error) {
    console.error("Error checking plan validity:", error);
    return { success: false, message: "Internal Server Error" };
  }
};

module.exports = {checkAndResetPlan};