const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "indianwife0001@gmail.com", // Your Gmail ID
    pass: "kifs aihr pkmu gvje", // Your Gmail App Password
  },
});

// Function to send Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    await transporter.sendMail({
      from: '"IndianWife.in" <your-email@gmail.com>',
      to: userEmail,
      subject: "Welcome to IndianWife.in!",
      html: `<h2>Welcome ${userName}!</h2><p>Thank you for signing up on our Matrimony platform. We hope you find your perfect match.</p>`,
    });
    console.log("Welcome Email Sent Successfully");
  } catch (error) {
    console.error("Error sending Welcome Email:", error);
  }
};

// Function to send Congratulations Email on Plan Purchase
const sendPlanPurchaseEmail = async (userEmail, userName, planName, orderId, amountPaid ) => {
  try {
    await transporter.sendMail({
      from: '"IndianWife.in" <your-email@gmail.com>',
      to: userEmail,
      subject: "Congratulations on Your Plan Purchase!",
      html: `<h2>🌟 Welcome to IndianWife.in, ${userName}! 🌟</h2>

<p>Dear ${userName},</p>

<p>We are thrilled to have you on board! 🎉 Thank you for joining <strong>IndianWife.in</strong>, where countless hearts connect to find their perfect match. Your journey towards love and companionship starts here! ❤️</p>

<hr>

<h3>📜 Payment Details</h3>
<ul>
  <li><strong>Order ID:</strong> ${orderId}</li>
  <li><strong>Plan Purchased:</strong> ${planName}</li>
  <li><strong>Amount Paid:</strong> ₹${amountPaid}</li>
</ul>

<hr>

<h3>🚀 What's Next?</h3>
<p>🌹 <strong>Start Connecting:</strong> Explore profiles and find your soulmate.</p>
<p>💬 <strong>Chat Seamlessly:</strong> Use our in-app messaging to get to know potential matches.</p>
<p>🎯 <strong>Enjoy Exclusive Features:</strong> Your premium plan unlocks special perks to enhance your experience!</p>

<hr>

<h3>💖 A Special Message Just for You!</h3>
<p>"Love is not about how many days, months, or years you have been together. It's all about how much you love each other every single day. We wish you a beautiful journey ahead!" 💑</p>

<hr>

<p>🚀 <strong>Ready to Begin?</strong> <a href="https://indianwife.in/login" style="color: blue; text-decoration: none;">Click here</a> to log in and start exploring.</p>

<p>Best wishes,<br>
💌 The IndianWife Team</p>
`,
    });
    console.log("Plan Purchase Email Sent Successfully");
  } catch (error) {
    console.error("Error sending Plan Purchase Email:", error);
  }
};

module.exports = { sendWelcomeEmail, sendPlanPurchaseEmail };
