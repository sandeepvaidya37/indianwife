const PromoCode = require("../models/PromoCode"); // Adjust the path as needed
const Plan = require("../models/Plan");

const savePromoCodeUsage = async (promoCode, userId, planName) => {
    try {
        // Find the promo code in the database
        let promo = await PromoCode.findOne({ code: promoCode });
        let plan = await Plan.findOne({ name: planName });

        if (!plan) {
          console.log("Plan does not exist.");
          return; // Exit if plan is not found
      }

        if (!promo) {
            console.log("promocode not exsist");
            return;
        } else {
            // If promo exists, push the new usage details
            promo.usedBy.push({ userId, planId: plan._id });
        }

        // Save the updated promo code
        await promo.save();
        console.log("Promo code usage saved successfully.");
    } catch (error) {
        console.error("Error saving promo code usage:", error);
    }
};

module.exports = savePromoCodeUsage;
