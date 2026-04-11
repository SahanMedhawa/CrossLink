const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/volunteerApiMocks');

test.describe('Mocking - Volunteer API call recording', () => {
  test('Feature C: captures request payload for participation submit', async () => {
    const api = new ApiStub();
    api.stub('POST', '/api/participation/request', 'requestParticipation');

    await api.post('/api/participation/request', {
      headers: { Authorization: 'Bearer volunteer-token' },
      data: {
        projectId: 'mock-project-id-101',
        message: 'I am excited to contribute to this project.',
        experienceSummary: 'I have 2 years of volunteer community experience.',
        availabilityConfirmed: true,
        expectedHours: 8,
      },
    });

    expect(api.calls).toHaveLength(1);
    expect(api.calls[0].method).toBe('POST');
    expect(api.calls[0].path).toBe('/api/participation/request');
    expect(api.calls[0].options.data.projectId).toBe('mock-project-id-101');
    expect(api.calls[0].options.data.availabilityConfirmed).toBe(true);
  });

  test('Feature D: captures status filter query for my applications', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/participation/my-applications', 'getMyApplications');

    const res = await api.get('/api/participation/my-applications?status=requested');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(api.calls[0].path).toContain('status=requested');
    expect(Array.isArray(body.data)).toBe(true);
  });
});

test.describe('Mocking - Volunteer API negative behavior', () => {
  test('Feature A: rejects invalid profile payload shape', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/volunteer/profile', 'invalidSkills');

    const res = await api.put('/api/volunteer/profile', {
      data: { skills: 'not-an-array' },
    });
    const body = await res.json();

    expect(res.status()).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/skills/i);
  });

  test('Feature D: blocks update when request is not editable', async () => {
    const api = new ApiStub();
    api.stub('PATCH', '/api/participation/mock-participation-id-202', 'updateForbidden');

    const res = await api.patch('/api/participation/mock-participation-id-202', {
      data: {
        message: 'Trying to edit approved request',
        experienceSummary: 'Trying to edit approved request with details',
      },
    });
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/cannot edit/i);
  });

  test('Feature D: blocks withdraw when request is already approved', async () => {
    const api = new ApiStub();
    api.stub('DELETE', '/api/participation/mock-participation-id-202', 'deleteForbidden');

    const res = await api.delete('/api/participation/mock-participation-id-202');
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/cannot delete/i);
  });
});
