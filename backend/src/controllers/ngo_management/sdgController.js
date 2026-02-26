const axios = require('axios');

const UN_SDG_API = 'https://unstats.un.org/SDGAPI/v1/sdg';
const SRI_LANKA_CODE = 'LKA';

const getGoals = async (req, res) => {
  try {
    const response = await axios.get(`${UN_SDG_API}/Goal/List`, {
      params: { includechildren: false }
    });
    res.status(200).json({ success: true, goals: response.data });
  } catch (error) {
    console.error('Error fetching SDG goals:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch SDG goals' });
  }
};

const getTargetsByGoal = async (req, res) => {
  try {
    const { goalNumber } = req.params;
    const response = await axios.get(`${UN_SDG_API}/Goal/${goalNumber}/Target/List`, {
      params: { includechildren: false }
    });
    res.status(200).json({ success: true, targets: response.data });
  } catch (error) {
    console.error(`Error fetching targets for goal ${req.params.goalNumber}:`, error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch SDG targets' });
  }
};

const getSriLankaSDG = async (req, res) => {
  try {
    const goalsResponse = await axios.get(`${UN_SDG_API}/Goal/List`, {
      params: { includechildren: false }
    });
    const goals = goalsResponse.data;

    const goalsWithTargets = await Promise.all(
      goals.map(async (goal) => {
        try {
          const targetsResponse = await axios.get(
            `${UN_SDG_API}/Goal/${goal.code}/Target/List`,
            { params: { includechildren: false } }
          );
          return { ...goal, targets: targetsResponse.data };
        } catch {
          return { ...goal, targets: [] };
        }
      })
    );

    res.status(200).json({
      success: true,
      country: 'Sri Lanka',
      countryCode: SRI_LANKA_CODE,
      totalGoals: goalsWithTargets.length,
      goals: goalsWithTargets
    });
  } catch (error) {
    console.error('Error fetching Sri Lanka SDG data:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch Sri Lanka SDG data' });
  }
};

module.exports = { getGoals, getTargetsByGoal, getSriLankaSDG };