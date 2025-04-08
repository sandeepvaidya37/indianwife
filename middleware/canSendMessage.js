const SupportMessage = require("../models/SupportMessage");

const canSendMessage = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const messagesToday = await SupportMessage.countDocuments({
    user: userId,
    createdAt: { $gte: today },
  });

  return messagesToday < 50; // Returns true if the user has sent less than 5 messages
};

module.exports = canSendMessage; // ✅ Correct Export
