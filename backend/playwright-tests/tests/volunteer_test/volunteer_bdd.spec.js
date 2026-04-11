const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/volunteerApiMocks');

async function given(desc, fn) {
  console.log(`\n    GIVEN ${desc}`);
  return fn();
}

async function when(desc, fn) {
  console.log(`    WHEN  ${desc}`);
  return fn();
}

async function then(desc, fn) {
  console.log(`    THEN  ${desc}`);
  return fn();
}

test.describe('BDD - Volunteer Discovery and Application Flow', () => {
  test('Feature B Scenario: volunteer sees ranked project matches', async () => {
    let api;
    let res;
    let body;

    await given('an authenticated volunteer with skills and interests', async () => {
      api = new ApiStub();
      api.stub('GET', '/api/matchmaking/projects', 'getMatchedProjects');
    });

    await when('the volunteer opens matched projects', async () => {
      res = await api.get('/api/matchmaking/projects');
      body = await res.json();
    });

    await then('the response contains sorted matches and fit indicators', async () => {
      expect(res.status()).toBe(200);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].matchScore).toBeGreaterThanOrEqual(body.data[1].matchScore);
      expect(Array.isArray(body.data[0].matchedSkills)).toBe(true);
      expect(Array.isArray(body.data[0].missingSkills)).toBe(true);
    });
  });

  test('Feature C Scenario: volunteer submits a participation request', async () => {
    let api;
    let res;
    let body;

    await given('a project that accepts new volunteers', async () => {
      api = new ApiStub();
      api.stub('POST', '/api/participation/request', 'requestParticipation');
    });

    await when('the volunteer sends valid motivation and experience details', async () => {
      res = await api.post('/api/participation/request', {
        data: {
          projectId: 'mock-project-id-101',
          message: 'I am excited to contribute to this project.',
          experienceSummary: 'I have 2 years of volunteer community experience.',
          availabilityConfirmed: true,
        },
      });
      body = await res.json();
    });

    await then('the API stores the request as pending', async () => {
      expect(res.status()).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('requested');
      expect(body.data).toHaveProperty('appliedAt');
    });
  });

  test('Feature D Scenario: volunteer updates and withdraws pending request', async () => {
    let api;
    let updateRes;
    let updateBody;
    let deleteRes;
    let deleteBody;

    await given('the volunteer has a pending participation request', async () => {
      api = new ApiStub();
      api.stub('PATCH', '/api/participation/mock-participation-id-201', 'updateParticipationRequest');
      api.stub('DELETE', '/api/participation/mock-participation-id-201', 'deleteParticipationRequest');
    });

    await when('the volunteer edits the request details', async () => {
      updateRes = await api.patch('/api/participation/mock-participation-id-201', {
        data: {
          message: 'Updated motivation statement for this project.',
          experienceSummary: 'Updated experience summary with stronger details.',
          expectedHours: 10,
        },
      });
      updateBody = await updateRes.json();
    });

    await then('the API accepts the update', async () => {
      expect(updateRes.status()).toBe(200);
      expect(updateBody.success).toBe(true);
      expect(updateBody.data.status).toBe('requested');
    });

    await when('the volunteer withdraws the same pending request', async () => {
      deleteRes = await api.delete('/api/participation/mock-participation-id-201');
      deleteBody = await deleteRes.json();
    });

    await then('the API confirms withdrawal', async () => {
      expect(deleteRes.status()).toBe(200);
      expect(deleteBody.success).toBe(true);
      expect(deleteBody.message).toMatch(/withdrawn/i);
    });
  });
});
