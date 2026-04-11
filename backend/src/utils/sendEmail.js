const nodemailer = require('nodemailer');

let hasWarnedMissingEmailConfig = false;
const MAIL_USER = process.env.GMAIL_USER || process.env.EMAIL_USER;
const MAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

const sendEmail = async (options) => {
  if (!MAIL_USER || !MAIL_PASS) {
    if (!hasWarnedMissingEmailConfig) {
      console.warn('⚠️ Email is not configured (set GMAIL_USER/GMAIL_APP_PASSWORD or EMAIL_USER/EMAIL_PASS). Skipping email sends.');
      hasWarnedMissingEmailConfig = true;
    }
    return;
  }

  if (!options?.to) {
    throw new Error('Email recipient is required (options.to).');
  }

  // 1. Create the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: MAIL_USER, 
      pass: MAIL_PASS, 
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // 2. Define the email options
  const mailOptions = {
    from: `CrossLink Platform <${MAIL_USER}>`,
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