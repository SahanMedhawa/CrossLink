const { test, expect } = require('@playwright/test');
const { ApiStub, MOCK_RESPONSES, mockRoute } = require('../../mocks/projectapimocks');

// ─────────────────────────────────────────────────────────────
// ApiStub — basic stubs across all endpoints
// ─────────────────────────────────────────────────────────────
test.describe('Mocking — All Endpoints Stubbed', () => {

  test('MOCK 1: getAllProjects — returns list without hitting server', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects', 'getAllProjects');

    const res  = await api.get('/api/projects');
    const body = await res.json();

    expect(res.ok()).toBe(true);
    expect(body.count).toBe(2);
    expect(body.projects[0].title).toBe('Beach Cleanup Drive');
    console.log('  GET /api/projects stubbed — no real network call');
  });

  test('MOCK 2: getProjectById — returns single project stub', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/mock-project-id-001', 'getProjectById');

    const res  = await api.get('/api/projects/mock-project-id-001');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.project._id).toBe('mock-project-id-001');
    expect(body.project.focusArea).toBe('Environment');
  });

  test('MOCK 3: updateProject — returns updated project stub', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/projects/mock-project-id-001', 'updateProject');

    const res  = await api.put('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer ngo-token' },
      data: { title: 'Beach Cleanup Drive — Updated' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.project.title).toContain('Updated');
  });

  test('MOCK 4: updateProjectStatus — stub status change to cancelled', async () => {
    const api = new ApiStub();
    api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'updateStatusCancelled');

    const res  = await api.patch('/api/projects/mock-project-id-001/status', {
      data: { status: 'cancelled' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.project.status).toBe('cancelled');
  });

  test('MOCK 5: deleteProject — stub successful deletion', async () => {
    const api = new ApiStub();
    api.stub('DELETE', '/api/projects/mock-project-id-001', 'deleteProject');

    const res  = await api.delete('/api/projects/mock-project-id-001');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.message).toBe('Project deleted successfully');
  });

  test('MOCK 6: getProjectsByNGO — returns only that NGO\'s projects', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/ngo/mock-ngo-id-001', 'ngoProjects');

    const res  = await api.get('/api/projects/ngo/mock-ngo-id-001');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.projects).toHaveLength(3);
    body.projects.forEach(p => expect(p.ngoId).toBe('mock-ngo-id-001'));
  });
});

// ─────────────────────────────────────────────────────────────
// Call recording — verify payloads sent to each endpoint
// ─────────────────────────────────────────────────────────────
test.describe('Mocking — Call Recording', () => {

  test('MOCK 7: records method, path, and payload for updateProject', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/projects/mock-project-id-001', 'updateProject');

    await api.put('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer ngo-jwt' },
      data: { title: 'New Title', volunteersNeeded: 30 },
    });

    expect(api.calls).toHaveLength(1);
    expect(api.calls[0].method).toBe('PUT');
    expect(api.calls[0].options.data.title).toBe('New Title');
    expect(api.calls[0].options.data.volunteersNeeded).toBe(30);
    expect(api.calls[0].options.headers.Authorization).toBe('Bearer ngo-jwt');
  });

  test('MOCK 8: records status change payload for updateProjectStatus', async () => {
    const api = new ApiStub();
    api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'updateStatus');

    await api.patch('/api/projects/mock-project-id-001/status', {
      headers: { Authorization: 'Bearer ngo-jwt' },
      data: { status: 'completed' },
    });

    expect(api.calls[0].options.data.status).toBe('completed');
    console.log('  Status change payload verified from call record');
  });
});

// ─────────────────────────────────────────────────────────────
// Error simulation across all endpoints
// ─────────────────────────────────────────────────────────────
test.describe('Mocking — Error Simulation', () => {

  test('MOCK 9: getProjectById returns 404 for unknown ID', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/unknown-id', 'notFound');

    const res  = await api.get('/api/projects/unknown-id');
    const body = await res.json();

    expect(res.status()).toBe(404);
    expect(body.message).toMatch(/not found/i);
  });

  test('MOCK 10: updateProject returns 403 for non-owner', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/projects/mock-project-id-001', 'notAuthorized');

    const res  = await api.put('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer wrong-token' },
      data: { title: 'Steal this project' },
    });
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.message).toContain('authorized');
  });

  test('MOCK 11: updateProjectStatus returns 400 for invalid status', async () => {
    const api = new ApiStub();
    api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'invalidStatus');

    const res  = await api.patch('/api/projects/mock-project-id-001/status', {
      data: { status: 'published' },
    });
    const body = await res.json();

    expect(res.status()).toBe(400);
    expect(body.message).toMatch(/draft|active|completed|cancelled/i);
  });

  test('MOCK 12: deleteProject returns 403 for non-owner', async () => {
    const api = new ApiStub();
    api.stub('DELETE', '/api/projects/mock-project-id-001', 'notAuthorized');

    const res  = await api.delete('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer wrong-token' },
    });

    expect(res.status()).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────
// page.route() — browser-level interception
// ─────────────────────────────────────────────────────────────
test.describe('Mocking — page.route() Browser Interception', () => {

  test('MOCK 13: intercept GET /api/projects in browser', async ({ page }) => {
    // Navigate to a real page first so relative URLs resolve correctly
    await page.goto('about:blank');
    await page.route('**/api/projects', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_RESPONSES.getAllProjects.body),
        });
      } else {
        route.continue();
      }
    });

    // Use full absolute URL — relative paths don't work in about:blank
    const result = await page.evaluate(async () => {
      const res = await fetch('http://localhost:5000/api/projects');
      return { status: res.status, body: await res.json() };
    });

    expect(result.status).toBe(200);
    expect(result.body.projects).toHaveLength(2);
  });

  test('MOCK 14: intercept DELETE and simulate 403 in browser', async ({ page }) => {
    await page.goto('about:blank');
    await page.route('**/api/projects/**', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_RESPONSES.notAuthorized.body),
        });
      } else {
        route.continue();
      }
    });

    // Use full absolute URL — relative paths don't work in about:blank
    const result = await page.evaluate(async () => {
      const res = await fetch('http://localhost:5000/api/projects/mock-project-id-001', { method: 'DELETE' });
      return { status: res.status, body: await res.json() };
    });

    expect(result.status).toBe(403);
    expect(result.body.success).toBe(false);
  });
});