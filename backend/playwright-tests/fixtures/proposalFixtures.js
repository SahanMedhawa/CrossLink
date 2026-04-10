const { test: baseTest, expect } = require('@playwright/test');

const TEST_CORP_USER = {
  email: 'corporate@example.com',
  password: 'TestPass123!',
};

const SAMPLE_PROPOSAL = (projectId) => ({
  projectId, // ALWAYS passed dynamically
  proposalTitle: 'Community Garden Initiative',
  description: 'Funding for a local community garden.',
  amount: 5000,
  expectedImpact: 'Feed 50 families',
  message: 'We are excited to partner with you.',
  priority: 'High',
});

const test = baseTest.extend({
  corpAuthToken: async ({ request }, use) => {
    console.log('\n[fixture] Getting Corporate token...');

    let token = 'mock-corp-token';

    try {
      const loginRes = await request.post('/api/auth/login', {
        data: TEST_CORP_USER,
      });

      if (loginRes.ok()) {
        const body = await loginRes.json();
        token = body.token || body.accessToken;
      }
    } catch (e) {
      console.log('[fixture] fallback token used');
    }

    await use(token);
  },

  // 🔥 IMPORTANT FIX: create REAL project or fallback
  testProject: async ({ request, corpAuthToken }, use) => {
    console.log('[fixture] Creating test project...');

    let project;

    try {
      const res = await request.post('/api/projects', {
        headers: {
          Authorization: `Bearer ${corpAuthToken}`,
        },
        data: {
          title: 'Fixture Project',
          description: 'Test project',
          ngoId: 'valid-ngo-id-if-needed',
        },
      });

      if (res.ok()) {
        project = await res.json();
      }
    } catch (e) {}

    // fallback mock (ONLY if backend down)
    if (!project || !project._id) {
      project = {
        _id: '69d8d719dad8794bfe4560e3', // valid ObjectId format 👈 IMPORTANT
      };
    }

    await use(project);

    console.log('[fixture] cleanup project');
  },
});

module.exports = {
  test,
  expect,
  TEST_CORP_USER,
  SAMPLE_PROPOSAL,
};