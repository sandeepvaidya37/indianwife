require('dotenv').config();
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to extract public_id from Cloudinary URL
function extractPublicId(imageUrl) {
    const regex = /\/upload\/([^\.]+)/;
    const match = imageUrl.match(regex);
    return match ? match[1] : null;
}

async function checkNudity(imageUrl) {
    try {
        const response = await axios.get("https://api.sightengine.com/1.0/check.json", {
            params: {
                url: imageUrl,
                models: "nudity,wad,offensive",
                api_user: process.env.SIGHTENGINE_API_USER,
                api_secret: process.env.SIGHTENGINE_API_SECRET
            }
        });

        console.log("Detection Result:", response.data);

        // Check if nudity is detected
        const nude = response.data.nudity.safe < 0.5;  

        if (nude) {
            console.log("⚠️ NSFW Content Detected! Deleting from Cloudinary...");

            // Extract public_id from URL
            const publicId = extractPublicId(imageUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                console.log("🚫 Image deleted from Cloudinary!");
            } else {
                console.log("❌ Failed to extract public_id from URL.");
            }

            return true;  // Nudity detected
        }

        console.log("✅ Safe Image");
        return false;  // No nudity detected
    } catch (error) {
        console.error("Error:", error);
        return false;  // Assume safe if error occurs
    }
}

module.exports = { checkNudity };
