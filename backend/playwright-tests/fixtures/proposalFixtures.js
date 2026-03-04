// fixtures/proposalFixtures.js
const { test: baseTest, expect } = require('@playwright/test');

const TEST_CORP_USER = {
  email: 'corporate@example.com',
  password: 'TestPass123!',
};

const SAMPLE_PROPOSAL = {
  projectId: 'mock-project-001',
  proposalTitle: 'Community Garden Initiative',
  description: 'Funding for a local community garden.',
  amount: 5000,
  expectedImpact: 'Feed 50 families',
  message: 'We are excited to partner with you.',
  priority: 'High',
};

const test = baseTest.extend({
  corpAuthToken: async ({ request }, use) => {
    console.log('\n  [fixture] 🔧 SETUP — obtaining Corporate auth token...');
    
    // FIXED: FULL URL instead of relative path
    const loginRes = await request.post('http://localhost:5000/api/auth/login', {
      data: { email: TEST_CORP_USER.email, password: TEST_CORP_USER.password },
    });
    
    let token = 'mock-corp-token';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.crosslink_token || body.token;
      console.log('  [fixture] ✅ Token obtained successfully.');
    } else {
      console.log('  [fixture] ⚠️ Login failed, using mock token.');
    }
    
    await use(token);
    console.log('  [fixture] 🧹 TEARDOWN — Corporate token released.');
  },
});

module.exports = { test, expect, SAMPLE_PROPOSAL, TEST_CORP_USER };