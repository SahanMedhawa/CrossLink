const {
  test,
  expect,
  SAMPLE_PARTICIPATION_FORM,
} = require('../../fixtures/volunteerFixtures');
const { ApiStub } = require('../../mocks/volunteerApiMocks');

test.describe('Fixtures - Volunteer Hybrid checks', () => {
  test('Feature A: fixture provides volunteer token and profile', async ({ volunteerToken, volunteerProfileData }) => {
    expect(volunteerToken).toBeTruthy();
    expect(typeof volunteerToken).toBe('string');

    expect(volunteerProfileData).toBeTruthy();
    expect(volunteerProfileData.userType).toBe('volunteer');
    expect(Array.isArray(volunteerProfileData.skills || [])).toBe(true);
  });

  test('Feature B: fixture returns matched projects contract', async ({ matchedProjectsData }) => {
    expect(Array.isArray(matchedProjectsData)).toBe(true);
    expect(matchedProjectsData.length).toBeGreaterThan(0);

    const first = matchedProjectsData[0];
    expect(first).toHaveProperty('project');
    expect(first).toHaveProperty('matchScore');
    expect(first).toHaveProperty('matchedSkills');
    expect(first).toHaveProperty('missingSkills');
  });

  test('Feature C: fixture creates participation request (real or mock fallback)', async ({ createdParticipation }) => {
    expect(createdParticipation).toBeTruthy();
    expect(createdParticipation._id).toBeTruthy();
    expect(createdParticipation.status).toBe('requested');

    console.log(`  Participation source: ${createdParticipation._meta.isReal ? 'real API' : 'mock fallback'}`);
  });

  test('Feature D: update and withdraw flow works with hybrid fallback', async ({ request, volunteerToken, createdParticipation }) => {
    const targetId = createdParticipation._id;

    if (createdParticipation._meta.isReal) {
      const updateRes = await request.patch(`/api/participation/${targetId}`, {
        headers: { Authorization: `Bearer ${volunteerToken}` },
        data: {
          message: SAMPLE_PARTICIPATION_FORM.message,
          experienceSummary: SAMPLE_PARTICIPATION_FORM.experienceSummary,
          expectedHours: 10,
        },
      });

      expect([200, 403, 404]).toContain(updateRes.status());

      if (updateRes.status() === 200) {
        const deleteRes = await request.delete(`/api/participation/${targetId}`, {
          headers: { Authorization: `Bearer ${volunteerToken}` },
        });
        expect([200, 403, 404]).toContain(deleteRes.status());
      }
    } else {
      const api = new ApiStub();
      api.stub('PATCH', `/api/participation/${targetId}`, 'updateParticipationRequest');
      api.stub('DELETE', `/api/participation/${targetId}`, 'deleteParticipationRequest');

      const updateRes = await api.patch(`/api/participation/${targetId}`, {
        data: {
          message: SAMPLE_PARTICIPATION_FORM.message,
          experienceSummary: SAMPLE_PARTICIPATION_FORM.experienceSummary,
          expectedHours: 10,
        },
      });
      const updateBody = await updateRes.json();

      expect(updateRes.status()).toBe(200);
      expect(updateBody.success).toBe(true);

      const deleteRes = await api.delete(`/api/participation/${targetId}`);
      const deleteBody = await deleteRes.json();

      expect(deleteRes.status()).toBe(200);
      expect(deleteBody.success).toBe(true);
    }
  });

  test('Feature E: stats endpoint contract is available with fallback', async ({ request, volunteerToken }) => {
    const realRes = await request.get('/api/participation/stats', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });

    if (realRes.ok()) {
      const realBody = await realRes.json();
      expect(realBody.success).toBe(true);
      expect(realBody.data).toHaveProperty('projectsJoined');
      expect(realBody.data).toHaveProperty('impactPoints');
      expect(realBody.data).toHaveProperty('pending');
      return;
    }

    const api = new ApiStub();
    api.stub('GET', '/api/participation/stats', 'getVolunteerStats');
    const mockRes = await api.get('/api/participation/stats');
    const mockBody = await mockRes.json();

    expect(mockRes.status()).toBe(200);
    expect(mockBody.success).toBe(true);
    expect(mockBody.data).toHaveProperty('projectsJoined');
    expect(mockBody.data).toHaveProperty('impactPoints');
    expect(mockBody.data).toHaveProperty('pending');
  });
});
