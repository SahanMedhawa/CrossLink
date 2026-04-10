// backend/playwright-tests/fixtures/fundingFixtures.js
const { test: baseTest, expect } = require('@playwright/test');

const TEST_CORP_USER = {
  email: 'corporate@example.com',
  password: 'TestPass123!',
};

const SAMPLE_FUNDING = {
  projectId: 'mock-project-001',
  fundingTitle: 'Q1 Community Support',
  amount: 5000,
  fundingType: 'Cash',
  paymentMethod: 'Bank Transfer',
  note: 'Initial funding',
};

const test = baseTest.extend({
  // 1. DEFINE corpAuthToken HERE
  corpAuthToken: async ({ request }, use) => {
    console.log('\n  [fixture] 🔧 SETUP — obtaining Corporate auth token...');
    let token = 'mock-corp-token'; // Default fallback

    try {
      const loginRes = await request.post('/api/auth/login', {
        data: { email: TEST_CORP_USER.email, password: TEST_CORP_USER.password },
      });

      if (loginRes.ok()) {
        const body = await loginRes.json();
        token = body.crosslink_token || body.token;
        console.log('  [fixture] ✅ Token obtained successfully.');
      } else {
        console.log('  [fixture] ⚠️ Login failed, using mock token.');
      }
    } catch (error) {
      console.log('  [fixture] ⚠️ Connection error, using mock token.');
    }

    await use(token);
    console.log('  [fixture] 🧹 TEARDOWN — Corporate token released.');
  },

  // 2. DEFINE sampleFundingData HERE
  sampleFundingData: async ({}, use) => {
    await use(SAMPLE_FUNDING);
  },

  // 3. DEFINE ngoToken HERE (Simple mock for funding tests)
  ngoToken: async ({}, use) => {
    await use('mock-ngo-token-for-funding-test');
  },

  // 4. DEFINE testProject HERE (Simple mock for funding tests)
  testProject: async ({}, use) => {
    await use({ 
      _id: 'mock-project-123', 
      title: 'Community Garden Initiative',
      ngoId: 'mock-ngo-id'
    });
  },
});

module.exports = { test, expect, SAMPLE_FUNDING, TEST_CORP_USER };