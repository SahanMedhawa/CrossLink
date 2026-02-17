const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create the transporter (the service that sends the email)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail service
    auth: {
      user: process.env.EMAIL_USER, // Your email from .env
      pass: process.env.EMAIL_PASS, // Your App Password from .env
    },
  });

  // 2. Define the email options (who, what, subject)
  const mailOptions = {
    from: `CrossLink Platform <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.message, // We use HTML for nice formatting
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;