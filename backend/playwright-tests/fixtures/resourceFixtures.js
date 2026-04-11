const { test: baseTest, expect } = require('@playwright/test');

const TEST_USERS = {
  ngo: {
    email: 'ngo@example.com',
    password: 'TestPass123!',
    userType: 'ngo',
    organizationName: 'Helping Hands NGO',
    _id: 'mock-ngo-id-001'
  },
  corporate: {
    email: 'corporate@example.com',
    password: 'TestPass123!',
    userType: 'corporate',
    companyName: 'Tech Corp',
    name: 'Shane Wotson',  // This maps to 'name' field in user model
    _id: 'mock-corporate-id-001'
  },
  otherCorporate: {
    email: 'other@example.com',
    password: 'TestPass123!',
    userType: 'corporate',
    companyName: 'Other Corp',
    name: 'Jane Smith',
    _id: 'mock-corporate-id-002'
  }
};

const SAMPLE_PROJECT = {
  _id: 'mock-project-id-001',
  title: 'Beach Cleanup Drive',
  description: 'Monthly cleanup of the local coastline.',
  focusArea: 'Environment',
  location: 'Colombo, Sri Lanka',
  organizationName: 'Helping Hands NGO',
  ngoId: 'mock-ngo-id-001',
  // Note: 'skills' field exists in project model, not just resources
  skills: ['Teamwork', 'Physical Fitness'],
  volunteersNeeded: 20,
  volunteersCount: 0,
  status: 'active',
  resources: [
    {
      name: 'Gloves',
      quantity: 50,
      description: 'Protective gloves for cleanup'
    },
    {
      name: 'Trash Bags',
      quantity: 100,
      description: 'Heavy-duty garbage bags'
    }
  ]
};

const SAMPLE_RESOURCE = {
  _id: 'mock-resource-id-001',
  projectId: 'mock-project-id-001',
  name: 'Gloves',
  totalQuantity: 50,
  remainingQuantity: 45,
  description: 'Protective gloves for cleanup',
  donatedBy: [
    {
      corporateId: 'mock-corporate-id-001',
      quantity: 5,
      donatedAt: new Date().toISOString()
    }
  ],
  createdAt: new Date().toISOString()
};

// ── Extended test object with custom fixtures ─────────────────
const test = baseTest.extend({

  // FIXTURE: ngoToken
  ngoToken: async ({ request }, use) => {
    console.log('\n  [fixture] 🔧 SETUP — obtaining NGO auth token...');
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.ngo.email,
        password: TEST_USERS.ngo.password,
      },
    });

    let token = 'mock-ngo-jwt-token';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      // Check your actual API response structure
      token = body.token || body.crosslink_token;
    }

    await use(token);
    console.log('  [fixture] 🧹 TEARDOWN — NGO token released.');
  },

  // FIXTURE: corporateToken
  corporateToken: async ({ request }, use) => {
    console.log('\n  [fixture] 🔧 SETUP — obtaining corporate auth token...');
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.corporate.email,
        password: TEST_USERS.corporate.password,
      },
    });

    let token = 'mock-corporate-jwt-token';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.token || body.crosslink_token;
    }

    await use(token);
    console.log('  [fixture] 🧹 TEARDOWN — corporate token released.');
  },

  // FIXTURE: otherCorporateToken
  otherCorporateToken: async ({ request }, use) => {
    console.log('\n  [fixture] 🔧 SETUP — obtaining other corporate token...');
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.otherCorporate.email,
        password: TEST_USERS.otherCorporate.password,
      },
    });

    let token = 'mock-other-corporate-jwt-token';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.token || body.crosslink_token;
    }

    await use(token);
    console.log('  [fixture] 🧹 TEARDOWN — other corporate token released.');
  },

  // FIXTURE: testProject
  testProject: async ({ request, ngoToken }, use) => {
    console.log('  [fixture] 🔧 SETUP — creating a test project...');

    let project = { ...SAMPLE_PROJECT };

    const res = await request.post('/api/projects', {
      headers: { Authorization: `Bearer ${ngoToken}` },
      data: {
        title: project.title,
        description: project.description,
        focusArea: project.focusArea,
        location: project.location,
        skills: project.skills,
        volunteersNeeded: project.volunteersNeeded,
        resources: project.resources,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      },
    });

    if (res.ok()) {
      const body = await res.json();
      project = body.project || body;
      console.log(`  [fixture]   project created: ${project._id}`);
    } else {
      console.log('  [fixture]   (server offline — using mock project)');
    }

    await use(project);

    // TEARDOWN
    if (project._id && !project._id.startsWith('mock-')) {
      await request.delete(`/api/projects/${project._id}`, {
        headers: { Authorization: `Bearer ${ngoToken}` },
      });
      console.log(`  [fixture] 🧹 TEARDOWN — project ${project._id} deleted.`);
    } else {
      console.log('  [fixture] 🧹 TEARDOWN — mock project discarded.');
    }
  },

  // FIXTURE: testResource
  testResource: async ({ request, ngoToken, testProject }, use) => {
    console.log('  [fixture] 🔧 SETUP — creating a test resource...');

    let resource = { ...SAMPLE_RESOURCE, projectId: testProject._id };

    // Note: Check if your API has a separate resource creation endpoint
    // If not, resources are created as part of project creation
    const res = await request.post('/api/resources', {
      headers: { Authorization: `Bearer ${ngoToken}` },
      data: {
        projectId: testProject._id,
        name: resource.name,
        totalQuantity: resource.totalQuantity,
        remainingQuantity: resource.remainingQuantity,
        description: resource.description
      },
    });

    if (res.ok()) {
      const body = await res.json();
      resource = body.resource || body;
      console.log(`  [fixture]   resource created: ${resource._id}`);
    } else {
      console.log('  [fixture]   (server offline — using mock resource)');
    }

    await use(resource);

    // TEARDOWN
    if (resource._id && !resource._id.startsWith('mock-')) {
      await request.delete(`/api/resources/${resource._id}`, {
        headers: { Authorization: `Bearer ${ngoToken}` },
      });
      console.log(`  [fixture] 🧹 TEARDOWN — resource ${resource._id} deleted.`);
    } else {
      console.log('  [fixture] 🧹 TEARDOWN — mock resource discarded.');
    }
  }
});

module.exports = { test, expect, SAMPLE_PROJECT, SAMPLE_RESOURCE, TEST_USERS };