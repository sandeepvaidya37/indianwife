const KYC = require("../models/KycApproval");

async function isKYCExists(userId) {
  try {
    const kycRecord = await KYC.findOne({ user: userId });
    return kycRecord ? true : false;
  } catch (error) {
    console.error("Error checking KYC:", error);
    return false; // Return false in case of error
  }
}

module.exports = { isKYCExists };
