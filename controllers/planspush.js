async function savePlansInBulk() {

  try {
    // Delete all previous plans
    await Plan.deleteMany({});

    // Define new plans
    const newPlans = [
      {
        name: "Basic99",
        price: 99,
        features: { views: 50, contacts: 1, intrests: 0, shortlis: 25 },
        durationInDays: 30
      },
      {
        name: "Pro299",
        price: 299,
        features: { views: 100, contacts: 5, intrests: 1, shortlis: 50 },
        durationInDays: 30
      },
      {
        name: "Pro599",
        price: 599,
        features: { views: 200, contacts: 10, intrests: 3, shortlis: 100 },
        durationInDays: 30
      },
      {
        name: "ProMax999",
        price: 999,
        features: { views: 300, contacts: 15, intrests: 5, shortlis: 150 },
        durationInDays: 90
      },
      {
        name: "ProMax1299",
        price: 1299,
        features: { views: 300, contacts: 20, intrests: 7, shortlis: 150 },
        durationInDays: 90
      },
      {
        name: "ProMax1499",
        price: 1499,
        features: { views: 300, contacts: 25, intrests: 10, shortlis: 150 },
        durationInDays: 90
      },
      {
        name: "Silver1699",
        price: 1699,
        features: { views: 300, contacts: 30, intrests: 12, shortlis: 150 },
        durationInDays: 180
      },
      {
        name: "Silver1899",
        price: 1899,
        features: { views: 300, contacts: 35, intrests: 15, shortlis: 150 },
        durationInDays: 180
      },
      {
        name: "Silver2199",
        price: 2199,
        features: { views: 300, contacts: 40, intrests: 18, shortlis: 150 },
        durationInDays: 180
      },
      {
        name: "Gold2499",
        price: 2499,
        features: { views: 400, contacts: 45, intrests: 21, shortlis: 200 },
        durationInDays: 365
      },
      {
        name: "Gold2799",
        price: 2499,
        features: { views: 400, contacts: 50, intrests: 25, shortlis: 200 },
        durationInDays: 365
      },
      {
        name: "Gold2999",
        price: 2499,
        features: { views: 400, contacts: 55, intrests: 27, shortlis: 200 },
        durationInDays: 365
      },
      {
        name: "Diamond7999",
        price: 7999,
        features: { views: 400, contacts: 70, intrests: 35, shortlis: 200 },
        durationInDays: 3650
      },
      {
        name: "Diamond9999",
        price: 9999,
        features: { views: 400, contacts: 80, intrests: 40, shortlis: 200 },
        durationInDays: 3650
      },
      {
        name: "Exclusive12999",
        price: 12999,
        features: { views: 400, contacts: 90, intrests: 45, shortlis: 200 },
        durationInDays: 3650
      },
      {
        name: "Sponsorship249",
        price: 249,
        durationInDays: 30
      },
      {
        name: "Sponsorship999",
        price: 999,
        durationInDays: 180
      },
      {
        name: "Sponsorship1599",
        price: 1599,
        durationInDays: 365
      },


    ];

    // Insert new plans
    await Plan.insertMany(newPlans);
    console.log("Plans saved successfully!");
  } catch (error) {
    console.error("Error saving plans:", error);
  } finally {
    mongoose.connection.close(); // Close connection after operation
  }
}

