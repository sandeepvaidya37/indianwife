const User = require("../models/User"); // Import User model
const axios = require("axios"); // For geocoding API

const filterUsers = async (req) => {
  try {
    const { 
      motherTongue, religion, state, City, degree, cast, 
      ageMin, ageMax, gender, manglikStatus, maritalStatus, 
      horoscopicMatch, jobSector, occupation, minAnnualIncome, 
      familyType 
    } = req.body;

    let query = { _id: { $ne: req.user._id } }; // Exclude logged-in user

    // Add dynamic filters based on provided fields
    if (motherTongue) query.motherTongue = motherTongue;
    if (state) query.state = state;
    if (religion) query.religion = religion;
    if (City) query.City = City;
    if (degree) query.degree = degree;
    if (cast) query.cast = cast;
    if (gender) query.gender = gender;
    if (manglikStatus) query.manglikStatus = manglikStatus;
    if (ageMin && ageMax) query.age = { $gte: ageMin, $lte: ageMax };
    if (maritalStatus) query.maritalStatus = maritalStatus;
    if (horoscopicMatch) query.horoscopicMatch = horoscopicMatch;
    if (jobSector) query.jobSector = jobSector;
    if (occupation) query.occupation = occupation;
    if (familyType) query.familyType = familyType;

    // Handle Geolocation Filtering (Find Users within 100km)
    if (City) {
      const location = await getCityCoordinates(City, state);
      if (location) {
        query.location = {
          $geoWithin: {
            $centerSphere: [location, 100 / 6378.1], // 100km radius
          },
        };
      }
    }

    // Fetch all users matching query
    let users = await User.find(query);

    // 🔥 Apply Annual Income Filter AFTER Fetching Users
    if (minAnnualIncome) {
      const minIncome = parseFloat(minAnnualIncome); // Convert input to number

      users = users.filter(user => {
        if (!user.annualIncome) return false; // Skip users without income
        const userIncome = parseFloat(user.annualIncome.replace(/[^0-9.]/g, "")); // Extract number from string
        return userIncome >= minIncome; // Compare extracted number
      });
    }

    // Separate sponsored users first, then shuffle other users
    let sponsoredUsers = users.filter(user => user.sponsorship?.isActive);
    let otherUsers = users.filter(user => !user.sponsorship?.isActive);

    sponsoredUsers = sponsoredUsers.sort(() => Math.random() - 0.5);
    otherUsers = otherUsers.sort(() => Math.random() - 0.5);

    return [...sponsoredUsers, ...otherUsers];

  } catch (error) {
    console.error("Error filtering users:", error);
    return []; // Return an empty array in case of error
  }
};

// Function to get city coordinates using OpenStreetMap API
const getCityCoordinates = async (City, state) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${City},${state},India`
    );
    if (response.data.length > 0) {
      return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
    }
    return null;
  } catch (error) {
    console.error("Error fetching city coordinates:", error);
    return null;
  }
};

module.exports = filterUsers;
