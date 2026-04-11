const nodemailer = require('nodemailer');
const { resolveFrontendBaseUrl } = require('./frontendBaseUrl');

const MAIL_USER = process.env.GMAIL_USER || process.env.EMAIL_USER;
const MAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
const FRONTEND_BASE_URL = resolveFrontendBaseUrl();
const isEmailConfigured = () => Boolean(MAIL_USER && MAIL_PASS);
let hasWarnedMissingGmailConfig = false;

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
});

// Common email styles
const emailStyles = {
  container: `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e8ed;
  `,
  header: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 30px;
    text-align: center;
  `,
  headerTitle: `
    color: white;
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `,
  headerSubtitle: `
    color: rgba(255,255,255,0.9);
    margin: 10px 0 0 0;
    font-size: 16px;
  `,
  content: `
    padding: 40px 30px;
    background: #ffffff;
  `,
  card: `
    background: #f8fafc;
    border-radius: 12px;
    padding: 25px;
    margin: 25px 0;
    border-left: 4px solid #667eea;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  `,
  button: `
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 40px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
  `,
  footer: `
    background: #f1f5f9;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  `,
  progressBar: `
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin: 15px 0;
  `,
  progressFill: `
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
  `
};

// Send donation confirmation to corporate donor
const sendDonationConfirmation = async (donation, project, corporate) => {
  try {
    if (!isEmailConfigured()) {
      if (!hasWarnedMissingGmailConfig) {
        console.warn('⚠️ Gmail is not configured (set GMAIL_USER/GMAIL_APP_PASSWORD or EMAIL_USER/EMAIL_PASS). Skipping donation emails.');
        hasWarnedMissingGmailConfig = true;
      }
      return { success: false, error: 'Email configuration missing' };
    }

    const progressPercentage = ((donation.totalQuantity - donation.remainingQuantity) / donation.totalQuantity) * 100;
    
    const mailOptions = {
      from: `"🌱 Resource Management" <${MAIL_USER}>`,
      to: corporate.email,
      subject: `✨ Thank You! Your donation to ${project.title} is confirmed`,
      html: `
        <div style="${emailStyles.container}">
          
          <!-- Header with gradient -->
          <div style="${emailStyles.header}">
            <h1 style="${emailStyles.headerTitle}">🎉 Thank You!</h1>
            <p style="${emailStyles.headerSubtitle}">Your generosity makes a difference</p>
          </div>
          
          <!-- Main Content -->
          <div style="${emailStyles.content}">
            
            <!-- Personalized Greeting -->
            <p style="font-size: 18px; color: #1e293b; margin-bottom: 20px;">
              Dear <strong style="color: #667eea;">${corporate.companyName || corporate.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-bottom: 25px;">
              Thank you for your generous contribution to <strong>${project.title}</strong>. 
              Your support helps us create lasting impact in the community.
            </p>
            
            <!-- Donation Summary Card -->
            <div style="${emailStyles.card}">
              <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px;">📦</span> Donation Summary
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #64748b; width: 40%; border-bottom: 1px solid #e2e8f0;">Resource:</td>
                  <td style="padding: 12px 0; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                    <span style="background: #e6f7ff; padding: 4px 12px; border-radius: 20px; color: #0066cc;">
                      ${donation.name}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Quantity Donated:</td>
                  <td style="padding: 12px 0; font-weight: 700; color: #10b981; border-bottom: 1px solid #e2e8f0; font-size: 20px;">
                    ${donation.quantity} units
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Organization:</td>
                  <td style="padding: 12px 0; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                    ${project.organizationName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Location:</td>
                  <td style="padding: 12px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                    📍 ${project.location}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b;">Donation Date:</td>
                  <td style="padding: 12px 0; color: #1e293b;">
                    🗓️ ${new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Progress Section -->
            <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px;">
                📊 Project Progress
              </h4>
              
              <!-- Progress Bar -->
              <div style="${emailStyles.progressBar}">
                <div style="${emailStyles.progressFill}; width: ${progressPercentage}%;"></div>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span style="color: #0369a1; font-weight: 600;">
                  ${donation.totalQuantity - donation.remainingQuantity} of ${donation.totalQuantity} units
                </span>
                <span style="color: ${donation.remainingQuantity === 0 ? '#10b981' : '#f59e0b'}; font-weight: 600;">
                  ${donation.remainingQuantity === 0 ? '🎯 Fully Funded!' : `${donation.remainingQuantity} still needed`}
                </span>
              </div>
            </div>
            
            <!-- Impact Message -->
            <div style="background: #fdf2f8; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #ec4899;">
              <p style="margin: 0; color: #831843; font-size: 15px;">
                <span style="font-size: 20px; margin-right: 8px;">💝</span>
                Your donation will help provide essential resources to those who need them most.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_BASE_URL}/projects/${project._id}" 
                 style="${emailStyles.button}">
                👉 View Project Progress
              </a>
            </div>
            
            <!-- Social Sharing -->
            <div style="text-align: center; margin: 20px 0; padding: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin-bottom: 15px;">Share your impact:</p>
              <a href="#" style="display: inline-block; margin: 0 8px; color: #1DA1F2; text-decoration: none;">Twitter</a>
              <span style="color: #cbd5e1;">•</span>
              <a href="#" style="display: inline-block; margin: 0 8px; color: #0077B5; text-decoration: none;">LinkedIn</a>
              <span style="color: #cbd5e1;">•</span>
              <a href="#" style="display: inline-block; margin: 0 8px; color: #4267B2; text-decoration: none;">Facebook</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="${emailStyles.footer}">
            <p style="color: #64748b; margin: 5px 0; font-size: 14px;">
              Thank you for being a corporate partner! 🌟
            </p>
            <p style="color: #94a3b8; margin: 5px 0; font-size: 12px;">
              This is an automated message from the Resource Management System.<br>
              © ${new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Donation confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send donation confirmation:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to NGO about new donation
const sendNgoNotification = async (donation, project, corporate) => {
  try {
    if (!isEmailConfigured()) {
      if (!hasWarnedMissingGmailConfig) {
        console.warn('⚠️ Gmail is not configured (set GMAIL_USER/GMAIL_APP_PASSWORD or EMAIL_USER/EMAIL_PASS). Skipping donation emails.');
        hasWarnedMissingGmailConfig = true;
      }
      return { success: false, error: 'Email configuration missing' };
    }

    const progressPercentage = ((donation.totalQuantity - donation.remainingQuantity) / donation.totalQuantity) * 100;
    
    const mailOptions = {
      from: `"🌱 Resource Management" <${MAIL_USER}>`,
      to: project.ngoEmail,
      subject: `🎁 Great News! New donation received for ${project.title}`,
      html: `
        <div style="${emailStyles.container}">
          
          <!-- Header with gradient -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">🎁 New Donation!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Someone just supported your project
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="${emailStyles.content}">
            
            <!-- Greeting -->
            <p style="font-size: 18px; color: #1e293b; margin-bottom: 20px;">
              Dear <strong style="color: #10b981;">${project.organizationName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your project <strong>${project.title}</strong> has received a new donation from a corporate partner.
            </p>
            
            <!-- Donation Details Card -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px;">🎁</span> Donation Details
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #64748b; width: 40%; border-bottom: 1px solid #e2e8f0;">Donor:</td>
                  <td style="padding: 12px 0; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                    <span style="background: #e0f2fe; padding: 4px 12px; border-radius: 20px; color: #0369a1;">
                      ${corporate.companyName || corporate.name}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Resource:</td>
                  <td style="padding: 12px 0; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                    ${donation.name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Quantity Donated:</td>
                  <td style="padding: 12px 0; font-weight: 700; color: #10b981; border-bottom: 1px solid #e2e8f0; font-size: 20px;">
                    ${donation.quantity} units
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b;">Donation Date:</td>
                  <td style="padding: 12px 0; color: #1e293b;">
                    🗓️ ${new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Project Progress -->
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #166534; font-size: 16px;">
                📊 Project Progress Update
              </h4>
              
              <!-- Progress Bar -->
              <div style="${emailStyles.progressBar}">
                <div style="height: 100%; background: linear-gradient(90deg, #10b981 0%, #059669 100%); border-radius: 4px; width: ${progressPercentage}%;"></div>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span style="color: #166534; font-weight: 600;">
                  ${donation.totalQuantity - donation.remainingQuantity} of ${donation.totalQuantity} units funded
                </span>
                <span style="color: ${donation.remainingQuantity === 0 ? '#10b981' : '#f59e0b'}; font-weight: 600;">
                  ${donation.remainingQuantity === 0 ? '✨ Fully Funded!' : `${donation.remainingQuantity} left`}
                </span>
              </div>
            </div>
            
            <!-- Milestone Message -->
            ${donation.remainingQuantity === 0 ? `
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <span style="font-size: 32px; display: block; margin-bottom: 10px;">🎉</span>
                <p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">
                  Congratulations! This resource is now fully funded!
                </p>
              </div>
            ` : ''}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_BASE_URL}/ngo/project-donations/${project._id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                👉 View All Donations
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="${emailStyles.footer}">
            <p style="color: #64748b; margin: 5px 0; font-size: 14px;">
              Keep up the amazing work! 🌟
            </p>
            <p style="color: #94a3b8; margin: 5px 0; font-size: 12px;">
              This is an automated notification from the Resource Management System.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ NGO notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send NGO notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendDonationConfirmation, sendNgoNotification };