const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `CrossLink Platform <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    // ✅ FIX: Change 'options.message' to 'options.html'
    // This matches the key we are sending from the controller
    html: options.html, 
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;