const Funding = require('../../models/funding');
const Project = require('../../models/project');
const User = require('../../models/user.model');
const sendEmail = require('../../utils/sendEmail');
const { createNotification } = require('../../services/notification.service');

const notifySafely = async (payload) => {
  try {
    await createNotification(payload);
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

// @desc    Create a new Funding Record (Corporate)
// @route   POST /api/funding
// @access  Private (Corporate)
exports.createFunding = async (req, res) => {
  try {
    const { projectId, fundingTitle, amount, fundingType, paymentMethod, note, receiptUrl } = req.body;
    const corporateId = req.user.id;

    // 1. Verify Project Exists & Get NGO Details
    const project = await Project.findById(projectId).populate('ngoId');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const ngoUser = project.ngoId;
    const corporateUser = await User.findById(corporateId).select('name companyName');
    const actorName = corporateUser?.companyName || corporateUser?.name || 'A corporate partner';

    // 2. Create Funding Record
    const newFunding = new Funding({
      projectId,
      corporateId,
      fundingTitle,
      amount,
      fundingType,
      paymentMethod,
      note,
      receiptUrl,
      status: 'Confirmed'
    });

    await newFunding.save();

    await notifySafely({
      recipient: ngoUser._id,
      recipientRole: 'ngo',
      actor: corporateId,
      actorRole: 'corporate',
      type: 'funding.created',
      title: 'New funding received',
      message: `${actorName} funded ${project.title} with LKR ${Number(amount).toLocaleString()}.`,
      link: '/ngo/proposals-fundings',
      uniqueKey: `funding:created:${newFunding._id}`,
      metadata: {
        fundingId: newFunding._id,
        projectId: project._id,
      },
    });

    await notifySafely({
      recipient: corporateId,
      recipientRole: 'corporate',
      actor: ngoUser._id,
      actorRole: 'ngo',
      type: 'funding.confirmed',
      title: 'Funding recorded',
      message: `Your funding for ${project.title} was recorded successfully.`,
      link: '/corporate/my-activities',
      uniqueKey: `funding:confirmed:${newFunding._id}`,
      metadata: {
        fundingId: newFunding._id,
        projectId: project._id,
      },
    });

    // 3. Send Email Notifications
    try {
      // To NGO
      await sendEmail({
        to: ngoUser.email,
        subject: `💰 New Funding Received: ${fundingTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h3 style="color: #28a745;">New Funding Alert!</h3>
            <p><strong>From:</strong> ${corporateUser.companyName || corporateUser.name}</p>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Amount:</strong> LKR ${amount.toLocaleString()}</p>
            <p><strong>Type:</strong> ${fundingType}</p>
            <p><strong>Method:</strong> ${paymentMethod}</p>
            <br/>
            <a href="${process.env.FRONTEND_URL}/ngo/dashboard" style="background:#28a745; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Funding</a>
          </div>
        `
      });

      // To Corporate
      await sendEmail({
        to: corporateUser.email,
        subject: '✅ Funding Recorded Successfully',
        html: `<p>Your funding for <strong>${project.title}</strong> has been recorded.</p>`
      });
    } catch (emailError) {
      console.error('Email failed:', emailError.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Funding recorded successfully', 
      data: newFunding 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all funding records for a specific project (NGO View)
// @route   GET /api/funding/project/:projectId
// @access  Private (NGO)
exports.getFundingByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const fundings = await Funding.find({ projectId }).lean()
      .populate('corporateId', 'companyName industry email')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: fundings.length, 
      data: fundings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all funding records by the logged-in Corporate
// @route   GET /api/funding/my
// @access  Private (Corporate)
exports.getMyFunding = async (req, res) => {
  try {
    const corporateId = req.user.id;
    
    const fundings = await Funding.find({ corporateId }).lean()
      .populate({
        path: 'projectId',
        select: 'title location ngoId',
        populate: {
          path: 'ngoId',
          select: 'organizationName'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: fundings.length, 
      data: fundings 
    });
  } catch (error) {
    console.error("Get My Funding Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}; 

// NEW FUNCTION: Get all fundings received by a specific NGO
// @desc    Get all fundings received by a specific NGO
// @route   GET /api/fundings/ngo/:ngoId
// @access  Private (NGO)
// ✅ UPDATED: Get all fundings received by a specific NGO
exports.getFundingsForNgo = async (req, res) => {
  try {
    const { ngoId } = req.params;

    // 🛑 SAFETY CHECK 1: Ensure ngoId exists
    if (!ngoId) {
      return res.status(400).json({ success: false, message: 'NGO ID is required' });
    }

    // 1. Find all Projects belonging to this NGO
    const projects = await Project.find({ ngoId }).lean().select('_id');

    if (projects.length === 0) {
      // Return empty array instead of crashing if no projects exist
      return res.json({ success: true, count: 0, data: [] });
    }

    const projectIds = projects.map(p => p._id);

    // 2. Find all Fundings linked to those projects
    const fundings = await Funding.find({ projectId: { $in: projectIds } }).lean()
      .populate('projectId', 'title')
      .populate('corporateId', 'companyName industry')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fundings.length,
      data: fundings
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR in getFundingsForNgo:', error); // Detailed error log
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};
