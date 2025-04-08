const sharp = require("sharp");
const fs = require("fs-extra");

// Function to check image size and compress if needed
async function compressImage(imagePath) {
    try {
        const stats = await fs.stat(imagePath);
        const fileSizeInMB = stats.size / (1024 * 1024); // Convert bytes to MB

        if (fileSizeInMB <= 5) {
            console.log("✅ Image is already under 5MB, no compression needed.");
            return imagePath; // Return the original path
        }

        console.log("⚠️ Image is larger than 5MB, compressing...");

        const compressedImagePath = imagePath.replace(/\.(jpg|jpeg|png)$/, "_compressed.$1");

        // Compress and resize image while maintaining quality
        await sharp(imagePath)
            .jpeg({ quality: 80 }) // Adjust quality (lower = more compression)
            .toFile(compressedImagePath);

        console.log("✅ Compression complete!");
        return compressedImagePath;

    } catch (error) {
        console.error("Error compressing image:", error);
        return null;
    }
}

module.exports = { compressImage };
