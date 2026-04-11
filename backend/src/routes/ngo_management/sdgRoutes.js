const express = require('express');
const router = express.Router();
const { getGoals, getTargetsByGoal, getSriLankaSDG } = require('../../controllers/ngo_management/sdgController');

router.get('/goals', getGoals);
router.get('/goals/:goalNumber/targets', getTargetsByGoal);
router.get('/srilanka', getSriLankaSDG);

module.exports = router;