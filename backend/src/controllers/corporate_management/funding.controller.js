const Funding = require('../../models/funding');
const Project = require('../../models/project');
const sendEmail = require('../../utils/sendEmail');

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
    const corporateUser = req.user;

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

    // 3. Send Email Notifications (Optional but recommended)
    try {
      // To NGO
      await sendEmail({
        to: ngoUser.email,
        subject: `💰 New Funding Received: ${fundingTitle}`,
        message: `
          <h3>New Funding Alert!</h3>
          <p><strong>From:</strong> ${corporateUser.companyName || corporateUser.name}</p>
          <p><strong>Project:</strong> ${project.title}</p>
          <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
          <p><strong>Type:</strong> ${fundingType}</p>
          <p><strong>Method:</strong> ${paymentMethod}</p>
          <br/>
          <a href="${process.env.FRONTEND_URL}/ngo/dashboard" style="background:#28a745; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Funding</a>
        `
      });

      // To Corporate
      await sendEmail({
        to: corporateUser.email,
        subject: '✅ Funding Recorded Successfully',
        message: `<p>Your funding for <strong>${project.title}</strong> has been recorded.</p>`
      });
    } catch (emailError) {
      console.error('Email failed:', emailError.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Funding recorded successfully', 
       newFunding 
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
    
    const fundings = await Funding.find({ projectId })
      .populate('corporateId', 'companyName industry email')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: fundings.length, 
       fundings 
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
    
    const fundings = await Funding.find({ corporateId })
      .populate('projectId', 'title organizationName location')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: fundings.length, 
       fundings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};