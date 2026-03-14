const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/volunteerApiMocks');

test.describe('Assertions - Volunteer Profile and Matchmaking', () => {
  test('Feature A: get profile returns volunteer contract', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/volunteer/profile', 'getVolunteerProfile');

    const res = await api.get('/api/volunteer/profile', {
      headers: { Authorization: 'Bearer volunteer-token' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.userType).toBe('volunteer');
    expect(Array.isArray(body.data.skills)).toBe(true);
    expect(Array.isArray(body.data.interests)).toBe(true);
  });

  test('Feature A: update profile keeps userType safe', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/volunteer/profile', 'updateVolunteerProfile');

    const res = await api.put('/api/volunteer/profile', {
      data: {
        name: 'Alice Volunteer Updated',
        userType: 'ngo',
        location: 'Kandy, Sri Lanka',
      },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.userType).toBe('volunteer');
    expect(body.data.name).toContain('Updated');
  });

  test('Feature B: matched projects are sorted and include UI fields', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/matchmaking/projects', 'getMatchedProjects');

    const res = await api.get('/api/matchmaking/projects');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(2);
    expect(body.data[0].matchScore).toBeGreaterThanOrEqual(body.data[1].matchScore);

    body.data.forEach((entry) => {
      expect(entry).toHaveProperty('project');
      expect(entry).toHaveProperty('matchScore');
      expect(entry).toHaveProperty('matchedSkills');
      expect(entry).toHaveProperty('missingSkills');
      expect(entry).toHaveProperty('alreadyApplied');
      expect(entry).toHaveProperty('participationId');
    });
  });
});

test.describe('Assertions - Participation and Stats', () => {
  test('Feature C: request participation success response shape', async () => {
    const api = new ApiStub();
    api.stub('POST', '/api/participation/request', 'requestParticipation');

    const res = await api.post('/api/participation/request', {
      data: {
        projectId: 'mock-project-id-101',
        message: 'I am excited to contribute to this project.',
        experienceSummary: 'I have 2 years of volunteer community experience.',
        availabilityConfirmed: true,
      },
    });
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('requested');
    expect(body.data.projectId).toBe('mock-project-id-101');
  });

  test('Feature C: request participation rejects short motivation', async () => {
    const api = new ApiStub();
    api.stub('POST', '/api/participation/request', 'requestValidationError');

    const res = await api.post('/api/participation/request', {
      data: {
        projectId: 'mock-project-id-101',
        message: 'short',
        experienceSummary: 'Enough experience text to pass validation.',
        availabilityConfirmed: true,
      },
    });
    const body = await res.json();

    expect(res.status()).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/at least 10 characters/i);
  });

  test('Feature E: volunteer stats include dashboard counters', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/participation/stats', 'getVolunteerStats');

    const res = await api.get('/api/participation/stats');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('projectsJoined');
    expect(body.data).toHaveProperty('pending');
    expect(body.data).toHaveProperty('ngosHelped');
    expect(body.data).toHaveProperty('impactPoints');
  });
});
