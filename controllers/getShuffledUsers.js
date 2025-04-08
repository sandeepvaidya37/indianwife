const User = require("../models/User");

const getShuffledUsers = async () => {
  try {
    const users = await User.aggregate([
      {
        $addFields: {
          isSponsored: {
            $cond: ["$sponsorship.isActive", 1, 0] // Convert sponsorship status to numeric value
          }
        }
      },
      { $sort: { isSponsored: -1 } }, // Sort: Sponsored users first
      { $sample: { size: 100 } } // Shuffle all users (adjust size as needed)
    ]);

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

module.exports = getShuffledUsers;
