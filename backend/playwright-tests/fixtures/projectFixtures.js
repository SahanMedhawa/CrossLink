const { test: baseTest, expect } = require('@playwright/test');


const TEST_USERS = {
  ngo: {
    email: 'ngo@example.com',
    password: 'TestPass123!',
    userType: 'ngo',
    organizationName: 'Helping Hands NGO',
  },
  volunteer: {
    email: 'volunteer@example.com',
    password: 'TestPass123!',
    userType: 'volunteer',
  },
};

const SAMPLE_PROJECT = {
  title: 'Beach Cleanup Drive',
  description: 'Monthly cleanup of the local coastline.',
  focusArea: 'Environment',
  location: 'Colombo, Sri Lanka',
  startDate: '2026-04-01',
  endDate: '2026-04-30',
  skills: ['Teamwork', 'Physical Fitness'],
  volunteersNeeded: 20,
  status: 'active',
};

// ── Extended test object with custom fixtures ─────────────────
const test = baseTest.extend({

  // FIXTURE: authToken
  // Logs in as the NGO user, stores JWT, and tears down after test
  authToken: async ({ request }, use) => {
    console.log('\n  [fixture] 🔧 SETUP — obtaining NGO auth token...');

    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.ngo.email,
        password: TEST_USERS.ngo.password,
      },
    });

    // If login fails (server not running) fall back to a mock token
    let token = 'mock-jwt-token-for-offline-demo';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.crosslink_token;
    }

    // ── Hand the token to the test ────────────────────────────
    await use(token);

    // ── TEARDOWN (runs after test, even on failure) ───────────
    console.log('  [fixture] 🧹 TEARDOWN — auth token released.');
  },

  // FIXTURE: createdProject
  // Depends on authToken; creates a project before test, deletes it after
  createdProject: async ({ request, authToken }, use) => {
    console.log('  [fixture] 🔧 SETUP — creating a test project...');

    let projectId = null;

    const res = await request.post('/api/projects', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: SAMPLE_PROJECT,
    });

    if (res.ok()) {
      const body = await res.json();
      projectId = body.project._id;
      console.log(`  [fixture]   project created: ${projectId}`);
    } else {
      console.log('  [fixture]   (server offline — using mock project id)');
      projectId = 'mock-project-id-12345';
    }

    // ── Hand the project ID to the test ──────────────────────
    await use({ id: projectId, ...SAMPLE_PROJECT });

    // ── TEARDOWN — delete project so DB stays clean ───────────
    if (projectId && projectId !== 'mock-project-id-12345') {
      await request.delete(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log(`  [fixture] 🧹 TEARDOWN — project ${projectId} deleted.`);
    } else {
      console.log('  [fixture] 🧹 TEARDOWN — mock project discarded.');
    }
  },

  // FIXTURE: volunteerToken
  // Logs in as a volunteer user (used to test forbidden actions)
  volunteerToken: async ({ request }, use) => {
    console.log('  [fixture] 🔧 SETUP — obtaining volunteer auth token...');

    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.volunteer.email,
        password: TEST_USERS.volunteer.password,
      },
    });

    let token = 'mock-volunteer-jwt-token';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.crosslink_token;
    }

    await use(token);

    console.log('  [fixture] 🧹 TEARDOWN — volunteer token released.');
  },
});

module.exports = { test, expect, SAMPLE_PROJECT, TEST_USERS };