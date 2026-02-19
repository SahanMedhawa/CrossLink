const express = require('express');
const router = express.Router();
const {
  createProposal,
  getProposalsByProject,
  updateProposalStatus,
  getMyProposals,
  updateProposal,
  deleteProposal 
} = require('../../controllers/corporate_management/proposal.controller');

// Import Auth Middleware
const { requireAuth } = require('../../middleware/auth.middleware');

// Protect all routes in this file
router.use(requireAuth);

// --- CORPORATE ROUTES ---
// Create a new proposal
router.post('/', createProposal);

// Get my own sent proposals
router.get('/my', getMyProposals);

//Update my own proposals
router.put('/:id', updateProposal);

//Delete my own proposal
router.delete('/:id', deleteProposal);

// --- NGO ROUTES ---
// Get all proposals for a specific project (to review)
router.get('/project/:projectId', getProposalsByProject);

// Accept or Reject a specific proposal
router.patch('/:id/status', updateProposalStatus);

module.exports = router;