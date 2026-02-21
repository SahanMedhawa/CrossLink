const Proposal = require('../../models/proposal');
const Project = require('../../models/project');
const sendEmail = require('../../utils/sendEmail');

// @desc    Create a new Proposal (Corporate)
// @route   POST /api/proposals
// @access  Private (Corporate)
exports.createProposal = async (req, res) => {
  try {
    const { 
      projectId, proposalTitle, description, amount, expectedImpact, message, 
      deliveryAddress, deliveryCoordinates, priority, documentUrl 
    } = req.body;
    
    const corporateId = req.user.id; // From auth middleware

    // 1. Verify Project Exists & Get NGO Details
    const project = await Project.findById(projectId).populate('ngoId');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const ngoUser = project.ngoId;
    const corporateUser = req.user;

    // 2. Create Proposal Document
    const newProposal = new Proposal({
      projectId,
      corporateId,
      proposalTitle,
      description,
      amount,
      expectedImpact,
      message,
      priority,
      documentUrl,
      deliveryLocation: {
        address: deliveryAddress,
        coordinates: deliveryCoordinates // { lat, lng }
      },
      status: 'Pending'
    });

    await newProposal.save();

    // 3. Send Email Notifications
    try {
      // Email to NGO
      await sendEmail({
        to: ngoUser.email,
        subject: `🔔 New Proposal: ${proposalTitle}`,
        message: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Collaboration Request</h2>
            <p><strong>From:</strong> ${corporateUser.companyName || corporateUser.name}</p>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Proposed Amount:</strong> $${amount.toLocaleString()}</p>
            <p><strong>Expected Impact:</strong> ${expectedImpact}</p>
            <p><strong>Message:</strong> ${message}</p>
            <br/>
            <a href="${process.env.FRONTEND_URL}/ngo/dashboard" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               View & Accept Proposal
            </a>
          </div>
        `
      });

      // Email to Corporate (Confirmation)
      await sendEmail({
        to: corporateUser.email,
        subject: '✅ Proposal Submitted Successfully',
        message: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Proposal Sent!</h2>
            <p>Your proposal for <strong>"${project.title}"</strong> has been sent to ${ngoUser.organizationName}.</p>
            <p>We will notify you once they review it.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email service failed:', emailError.message);
      // We do not fail the request if email fails, just log it
    }

    res.status(201).json({ 
      success: true, 
      message: 'Proposal created and notifications sent', 
      data: newProposal 
    });

  } catch (error) {
    console.error('Create Proposal Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};


// @desc    Get all proposals for a specific project (NGO View)
// @route   GET /api/proposals/project/:projectId
// @access  Private (NGO)
exports.getProposalsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const proposals = await Proposal.find({ projectId })
      .populate('corporateId', 'companyName industry email location')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: proposals.length, 
      data: proposals 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Update Proposal Details (Corporate Only)
// @route   PUT /api/proposals/:id
// @access  Private (Corporate)
exports.updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { proposalTitle, description, amount, expectedImpact, message, priority, deliveryAddress, deliveryCoordinates } = req.body;
    
    const corporateId = req.user.id;

    // 1. Find the proposal
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // 2. Security Check: Only the creator (Corporate) can edit
    if (proposal.corporateId.toString() !== corporateId) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this proposal' });
    }

    // 3. Business Logic: Cannot edit if already Accepted or Rejected
    if (proposal.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot edit a proposal that has already been reviewed by the NGO.' 
      });
    }

    // 4. Update fields (only if provided)
    if (proposalTitle) proposal.proposalTitle = proposalTitle;
    if (description) proposal.description = description;
    if (amount) proposal.amount = amount;
    if (expectedImpact) proposal.expectedImpact = expectedImpact;
    if (message) proposal.message = message;
    if (priority) proposal.priority = priority;
    
    if (deliveryAddress) {
      proposal.deliveryLocation.address = deliveryAddress;
      proposal.deliveryLocation.coordinates = deliveryCoordinates || proposal.deliveryLocation.coordinates;
    }

    await proposal.save();

    res.json({ 
      success: true, 
      message: 'Proposal updated successfully', 
      data: proposal 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


 // @desc    Delete a Proposal (Corporate Only)
// @route   DELETE /api/proposals/:id
// @access  Private (Corporate)
exports.deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const corporateId = req.user.id;

    // 1. Find the proposal
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // 2. Security Check: Only the creator can delete
    if (proposal.corporateId.toString() !== corporateId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized. Only the creating corporate can delete this proposal.' 
      });
    }

    // 3. Business Logic Warning (Optional but good practice)
    // Prevent deletion if already Accepted to avoid breaking data integrity
    if (proposal.status === 'Accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete an Accepted proposal. Please contact support or update status to Rejected first.' 
      });
    }

    // 4. Delete the document
    await Proposal.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Proposal deleted successfully',
      data:{} 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};




// @desc    Update Proposal Status (Accept/Reject) - NGO Action
// @route   PATCH /api/proposals/:id/status
// @access  Private (NGO)
exports.updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const proposal = await Proposal.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    ).populate('projectId corporateId');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Optional: Add email notification logic here for status update

    res.json({ 
      success: true, 
      message: `Proposal successfully ${status}`, 
      data: proposal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get all proposals sent by the logged-in Corporate
// @route   GET /api/proposals/my
// @access  Private (Corporate)
exports.getMyProposals = async (req, res) => {
  try {
    const corporateId = req.user.id;
    
    const proposals = await Proposal.find({ corporateId })
      .populate('projectId', 'title organizationName status location')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: proposals.length, 
      data: proposals 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};