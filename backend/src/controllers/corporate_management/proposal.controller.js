const Proposal = require('../../models/proposal');
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

// @desc    Create a new Proposal (Corporate)
// @route   POST /api/proposals
// @access  Private (Corporate)
exports.createProposal = async (req, res) => {
  try {
    const { 
      projectId, proposalTitle, description, amount, expectedImpact, message, 
      deliveryLocation, priority, documentUrl 
    } = req.body;
    
    const corporateId = req.user.id;

    // 1. Verify Project Exists & Get NGO Details
    const project = await Project.findById(projectId).populate('ngoId');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const ngoUser = project.ngoId;
    const corporateUser = await User.findById(corporateId).select('name companyName email');
    const actorName = corporateUser?.companyName || corporateUser?.name || 'A corporate partner';

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
      deliveryLocation: deliveryLocation || { address: '', coordinates: { lat: 0, lng: 0 } },
      status: 'Pending'
    });

    await newProposal.save();

    await notifySafely({
      recipient: ngoUser._id,
      recipientRole: 'ngo',
      actor: corporateId,
      actorRole: 'corporate',
      type: 'proposal.created',
      title: 'New collaboration proposal',
      message: `${actorName} sent a new proposal for ${project.title}.`,
      link: '/ngo/proposals-fundings',
      uniqueKey: `proposal:created:${newProposal._id}`,
      metadata: {
        proposalId: newProposal._id,
        projectId: project._id,
      },
    });

    await notifySafely({
      recipient: corporateId,
      recipientRole: 'corporate',
      actor: ngoUser._id,
      actorRole: 'ngo',
      type: 'proposal.submitted',
      title: 'Proposal submitted',
      message: `Your proposal for ${project.title} was submitted successfully.`,
      link: '/corporate/my-activities',
      uniqueKey: `proposal:submitted:${newProposal._id}`,
      metadata: {
        proposalId: newProposal._id,
        projectId: project._id,
      },
    });

    // 3. Send Email Notifications
    try {
      // Email to NGO
      await sendEmail({
        to: ngoUser.email,
        subject: `🔔 New Proposal: ${proposalTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #6B46C1;">New Collaboration Request</h2>
            <p><strong>From:</strong> ${corporateUser.companyName || corporateUser.name}</p>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Proposed Amount:</strong> LKR ${amount.toLocaleString()}</p>
            <p><strong>Expected Impact:</strong> ${expectedImpact}</p>
            <p><strong>Message:</strong> ${message}</p>
            ${deliveryLocation?.address ? `<p><strong>Location:</strong> ${deliveryLocation.address}</p>` : ''}
            <br/>
            <a href="${process.env.FRONTEND_URL}/ngo/dashboard" 
               style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
               View & Accept Proposal
            </a>
          </div>
        `
      });

      // Email to Corporate (Confirmation)
      await sendEmail({
        to: corporateUser.email,
        subject: '✅ Proposal Submitted Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #6B46C1;">Proposal Sent!</h2>
            <p>Your proposal for <strong>"${project.title}"</strong> has been sent to ${ngoUser.organizationName}.</p>
            <p>We will notify you once they review it.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email service failed:', emailError.message);
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
    
    const proposals = await Proposal.find({ projectId }).lean()
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
    const { proposalTitle, description, amount, expectedImpact, message, priority, deliveryLocation } = req.body;
    
    const corporateId = req.user.id;
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.corporateId.toString() !== corporateId) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this proposal' });
    }

    if (proposal.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot edit a proposal that has already been reviewed by the NGO.' 
      });
    }

    if (proposalTitle) proposal.proposalTitle = proposalTitle;
    if (description) proposal.description = description;
    if (amount) proposal.amount = amount;
    if (expectedImpact) proposal.expectedImpact = expectedImpact;
    if (message) proposal.message = message;
    if (priority) proposal.priority = priority;
    
    if (deliveryLocation) {
      if (deliveryLocation.address) proposal.deliveryLocation.address = deliveryLocation.address;
      if (deliveryLocation.coordinates) proposal.deliveryLocation.coordinates = deliveryLocation.coordinates;
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
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.corporateId.toString() !== corporateId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized. Only the creating corporate can delete this proposal.' 
      });
    }

    if (proposal.status === 'Accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete an Accepted proposal. Please contact support or update status to Rejected first.' 
      });
    }

    await Proposal.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Proposal deleted successfully',
      data: {} 
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
    const { status } = req.body; 

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

    await notifySafely({
      recipient: proposal.corporateId?._id || proposal.corporateId,
      recipientRole: 'corporate',
      actor: req.user.id,
      actorRole: 'ngo',
      type: 'proposal.status-updated',
      title: 'Proposal reviewed',
      message: `Your proposal for ${proposal.projectId?.title || 'a project'} was marked as ${status}.`,
      link: '/corporate/my-activities',
      uniqueKey: `proposal:status:${proposal._id}:${status}`,
      metadata: {
        proposalId: proposal._id,
        projectId: proposal.projectId?._id || proposal.projectId,
        status,
      },
    });

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

// @desc    Get all proposals sent by the logged-in Corporate (WITH SEARCH)
// @route   GET /api/proposals/my?search=keyword
// @access  Private (Corporate)
exports.getMyProposals = async (req, res) => {
  try {
    const corporateId = req.user.id;
    const { search } = req.query;
    
    let query = { corporateId };

    if (search && search.trim() !== '') {
      query.proposalTitle = { 
        $regex: search, 
        $options: 'i' 
      };
    }

    const proposals = await Proposal.find(query).lean()
      .populate('projectId', 'title organizationName status location')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: proposals.length, 
      data: proposals 
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

//  NEW: Get all proposals received by a specific NGO
// @route   GET /api/proposals/ngo/:ngoId
// @access  Private (NGO)
exports.getProposalsForNgo = async (req, res) => {
  try {
    const { ngoId } = req.params;

    // 1. Find all Projects belonging to this NGO
    const projects = await Project.find({ ngoId }).lean().select('_id');
    const projectIds = projects.map(p => p._id);

    // 2. Find all Proposals linked to those projects
    const proposals = await Proposal.find({ projectId: { $in: projectIds } }).lean()
      .populate('projectId', 'title')
      .populate('corporateId', 'companyName industry email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: proposals.length,
      data: proposals
    });

  } catch (error) {
    console.error('Get NGO Proposals Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};
