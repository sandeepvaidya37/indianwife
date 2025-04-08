const axios = require("axios");

async function getCoordinates(city, state) {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&format=json&limit=1`;

    const response = await axios.get(url, {
        headers: { "User-Agent": "YourAppName/1.0 (your@email.com)" }
    });

    if (response.data.length > 0) {
        return {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon),
        };
    } else {
        throw new Error("Location not found");
    }
}

module.exports = getCoordinates;
