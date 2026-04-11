const Proposal = require('../../models/proposal');
const Funding = require('../../models/funding');

exports.getImpactReport = async (req, res) => {
  try {
    const corporateId = req.user.id;

    // 1. Fetch All Relevant Data
    const proposals = await Proposal.find({ corporateId }).populate('projectId', 'title ngoId');
    const fundings = await Funding.find({ corporateId }).populate('projectId', 'title ngoId');

    // 2. Calculate Metrics
    const totalInvestment = 
      proposals.filter(p => p.status === 'Accepted').reduce((sum, p) => sum + p.amount, 0) +
      fundings.reduce((sum, f) => sum + f.amount, 0);

    const projectsSupported = new Set([
      ...proposals.map(p => p.projectId?._id),
      ...fundings.map(f => f.projectId?._id)
    ]).size;

    const successRate = proposals.length > 0 
      ? ((proposals.filter(p => p.status === 'Accepted').length / proposals.length) * 100).toFixed(1) 
      : 0;

    // 3. Prepare Chart Data (Example: By Focus Area/Category)
    // Note: need to map 'focusArea' from the populated NGO/Project data
    const categoryData = {}; 
    // ... logic to group amounts by category ...

    res.json({
      success: true,
      data: {
        metrics: {
          totalInvestment,
          projectsSupported,
          successRate,
          totalProposalsSent: proposals.length
        },
        transactions: [
          ...proposals.map(p => ({ date: p.createdAt, type: 'Proposal', title: p.projectId?.title, amount: p.amount, status: p.status })),
          ...fundings.map(f => ({ date: f.createdAt, type: 'Funding', title: f.projectId?.title, amount: f.amount, status: 'Completed' }))
        ].sort((a, b) => b.date - a.date) // Sort by newest
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};