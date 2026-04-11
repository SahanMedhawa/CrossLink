const { test: baseTest, expect } = require('@playwright/test');
const { ApiStub } = require('../mocks/volunteerApiMocks');

const TEST_USERS = {
  volunteer: {
    email: 'volunteer@example.com',
    password: 'TestPass123!',
  },
};

const SAMPLE_PARTICIPATION_FORM = {
  message: 'I am committed and ready to support this project team.',
  experienceSummary: 'I have prior experience in social and community initiatives.',
  availabilityConfirmed: true,
  preferredRole: 'Coordinator',
  expectedHours: 8,
};

const SAMPLE_VOLUNTEER_PROFILE = {
  _id: 'mock-volunteer-id-001',
  name: 'Alice Volunteer',
  email: 'volunteer@example.com',
  userType: 'volunteer',
  skills: ['Teamwork', 'Mentoring'],
  interests: ['Education', 'Environment'],
  availability: 'Weekends',
  location: 'Colombo, Sri Lanka',
};

const test = baseTest.extend({
  volunteerToken: async ({ request }, use) => {
    console.log('\n  [fixture] SETUP - obtaining volunteer auth token...');

    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.volunteer.email,
        password: TEST_USERS.volunteer.password,
      },
    });

    let token = 'mock-volunteer-jwt-token';
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.crosslink_token || body.token || token;
    }

    await use(token);
    console.log('  [fixture] TEARDOWN - volunteer token released.');
  },

  volunteerProfileData: async ({ request, volunteerToken }, use) => {
    let profile = { ...SAMPLE_VOLUNTEER_PROFILE };
    const realRes = await request.get('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });

    if (realRes.ok()) {
      const body = await realRes.json();
      if (body && body.success && body.data) {
        profile = body.data;
      }
    } else {
      const api = new ApiStub();
      api.stub('GET', '/api/volunteer/profile', 'getVolunteerProfile');
      const mocked = await api.get('/api/volunteer/profile');
      const mockedBody = await mocked.json();
      profile = mockedBody.data;
    }

    await use(profile);
  },

  matchedProjectsData: async ({ request, volunteerToken }, use) => {
    let matches = [];
    const realRes = await request.get('/api/matchmaking/projects', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });

    if (realRes.ok()) {
      const body = await realRes.json();
      if (body && body.success && Array.isArray(body.data)) {
        matches = body.data;
      }
    }

    if (!matches.length) {
      const api = new ApiStub();
      api.stub('GET', '/api/matchmaking/projects', 'getMatchedProjects');
      const mocked = await api.get('/api/matchmaking/projects');
      const mockedBody = await mocked.json();
      matches = mockedBody.data;
    }

    await use(matches);
  },

  createdParticipation: async ({ request, volunteerToken, matchedProjectsData }, use) => {
    const targetProjectId = matchedProjectsData[0]?.project?._id || 'mock-project-id-101';

    let record = {
      _id: 'mock-participation-id-201',
      status: 'requested',
      projectId: targetProjectId,
      _meta: { isReal: false },
    };

    const realRes = await request.post('/api/participation/request', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        projectId: targetProjectId,
        ...SAMPLE_PARTICIPATION_FORM,
      },
    });

    if (realRes.ok()) {
      const body = await realRes.json();
      if (body && body.success && body.data) {
        record = {
          ...body.data,
          _meta: { isReal: true },
        };
      }
    } else {
      const api = new ApiStub();
      api.stub('POST', '/api/participation/request', 'requestParticipation');
      const mocked = await api.post('/api/participation/request', {
        data: {
          projectId: targetProjectId,
          ...SAMPLE_PARTICIPATION_FORM,
        },
      });
      const mockedBody = await mocked.json();
      record = {
        ...mockedBody.data,
        projectId: targetProjectId,
        _meta: { isReal: false },
      };
    }

    await use(record);

    if (record._meta.isReal && record.status === 'requested') {
      await request.delete(`/api/participation/${record._id}`, {
        headers: { Authorization: `Bearer ${volunteerToken}` },
      });
    }
  },
});

module.exports = {
  test,
  expect,
  TEST_USERS,
  SAMPLE_PARTICIPATION_FORM,
  SAMPLE_VOLUNTEER_PROFILE,
};
