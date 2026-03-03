// tests/01-assertions.spec.js
// ============================================================
// FEATURE 1 — ASSERTIONS
// Covers: createProject, getAllProjects, getProjectById,
//         updateProject, deleteProject, updateProjectStatus,
//         getProjectsByNGO
// ============================================================

const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/projectapimocks');

// ─────────────────────────────────────────────────────────────
// createProject
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — createProject', () => {

  test('returns 201 with correct project shape on success', async () => {
    const api = new ApiStub();
    api.stub('POST', '/api/projects', 'createProject');

    const res  = await api.post('/api/projects', {
      headers: { Authorization: 'Bearer ngo-token' },
      data: { title: 'Beach Cleanup', focusArea: 'Environment', volunteersNeeded: 20 },
    });
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body.success).toBe(true);
    expect(body.project).toBeTruthy();
    expect(typeof body.project._id).toBe('string');
    expect(body.project.status).toBe('active');
    expect(body.project.volunteersNeeded).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.project.skills)).toBe(true);
  });

  test('returns 403 when a volunteer tries to create a project', async () => {
    const api = new ApiStub();
    api.stub('POST', '/api/projects', 'forbidden');

    const res  = await api.post('/api/projects', {
      headers: { Authorization: 'Bearer volunteer-token' },
      data: { title: 'Unauthorized' },
    });
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toContain('NGO');
  });

  test('returns 400 for invalid volunteersNeeded value', async () => {
    const api = new ApiStub();
    api.stub('POST', '/api/projects', 'validationError');

    const res  = await api.post('/api/projects', {
      headers: { Authorization: 'Bearer ngo-token' },
      data: { title: 'Bad Project', volunteersNeeded: -1 },
    });
    const body = await res.json();

    expect(res.status()).toBe(400);
    expect(body.message).toMatch(/volunteersNeeded/i);
    expect(body.message).toMatch(/integer/i);
  });
});

// ─────────────────────────────────────────────────────────────
// getAllProjects
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — getAllProjects', () => {

  test('returns 200 with array of active projects', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects', 'getAllProjects');

    const res  = await api.get('/api/projects?status=active');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.projects)).toBe(true);
    expect(body.projects).toHaveLength(2);
    expect(body.count).toBe(body.projects.length);

    body.projects.forEach(p => {
      expect(p).toHaveProperty('_id');
      expect(p).toHaveProperty('title');
      expect(p.status).toBe('active');
    });
  });

  test('filters projects by focusArea', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects', 'getAllProjects');

    const res  = await api.get('/api/projects?focusArea=Environment');
    const body = await res.json();

    expect(res.status()).toBe(200);
    body.projects.forEach(p => expect(p.focusArea).toBe('Environment'));
  });
});

// ─────────────────────────────────────────────────────────────
// getProjectById
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — getProjectById', () => {

  test('returns 200 with full project details for a valid ID', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/mock-project-id-001', 'getProjectById');

    const res  = await api.get('/api/projects/mock-project-id-001');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.project._id).toBe('mock-project-id-001');
    expect(body.project.title).toBeTruthy();
    expect(body.project.volunteersNeeded).toBeGreaterThanOrEqual(1);
  });

  test('returns 404 when project ID does not exist', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/nonexistent-id', 'notFound');

    const res  = await api.get('/api/projects/nonexistent-id');
    const body = await res.json();

    expect(res.status()).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/not found/i);
  });

  test('soft assertions — validate all project fields at once', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/mock-project-id-001', 'getProjectById');

    const res  = await api.get('/api/projects/mock-project-id-001');
    const body = await res.json();
    const p    = body.project;

    expect.soft(res.status()).toBe(200);
    expect.soft(p._id).toBeTruthy();
    expect.soft(p.title).toBe('Beach Cleanup Drive');
    expect.soft(p.status).toBe('active');
    expect.soft(p.volunteersNeeded).toBe(20);
    expect.soft(p.focusArea).toBe('Environment');
  });
});

// ─────────────────────────────────────────────────────────────
// updateProject
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — updateProject', () => {

  test('returns 200 with updated project data', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/projects/mock-project-id-001', 'updateProject');

    const res  = await api.put('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer ngo-token' },
      data: { title: 'Beach Cleanup Drive — Updated' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('updated');
    expect(body.project.title).toContain('Updated');
  });

  test('returns 403 when a different NGO tries to update the project', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/projects/mock-project-id-001', 'forbidden');

    const res  = await api.put('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer other-ngo-token' },
      data: { title: 'Hijacked Title' },
    });
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.success).not.toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// updateProjectStatus
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — updateProjectStatus', () => {

  test('returns 200 when NGO marks project as completed', async () => {
    const api = new ApiStub();
    api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'updateStatus');

    const res  = await api.patch('/api/projects/mock-project-id-001/status', {
      headers: { Authorization: 'Bearer ngo-token' },
      data: { status: 'completed' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.project.status).toBe('completed');
    expect(body.message).toMatch(/completed/i);
  });

  test('returns 400 for an invalid status value', async () => {
    const api = new ApiStub();
    api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'invalidStatus');

    const res  = await api.patch('/api/projects/mock-project-id-001/status', {
      headers: { Authorization: 'Bearer ngo-token' },
      data: { status: 'invalid-status' },
    });
    const body = await res.json();

    expect(res.status()).toBe(400);
    expect(body.message).toMatch(/draft|active|completed|cancelled/i);
  });
});

// ─────────────────────────────────────────────────────────────
// deleteProject
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — deleteProject', () => {

  test('returns 200 with success message when owner deletes project', async () => {
    const api = new ApiStub();
    api.stub('DELETE', '/api/projects/mock-project-id-001', 'deleteProject');

    const res  = await api.delete('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer ngo-token' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Project deleted successfully');
  });

  test('returns 403 when non-owner tries to delete the project', async () => {
    const api = new ApiStub();
    api.stub('DELETE', '/api/projects/mock-project-id-001', 'forbidden');

    const res  = await api.delete('/api/projects/mock-project-id-001', {
      headers: { Authorization: 'Bearer wrong-ngo-token' },
    });
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// getProjectsByNGO
// ─────────────────────────────────────────────────────────────
test.describe('Assertions — getProjectsByNGO', () => {

  test('returns all projects belonging to a specific NGO', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/ngo/mock-ngo-id-001', 'ngoProjects');

    const res  = await api.get('/api/projects/ngo/mock-ngo-id-001');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body.projects)).toBe(true);
    body.projects.forEach(p => expect(p.ngoId).toBe('mock-ngo-id-001'));
  });

  test('returns empty array when NGO has no projects', async () => {
    const api = new ApiStub();
    api.stub('GET', '/api/projects/ngo/empty-ngo-id', 'emptyProjects');

    const res  = await api.get('/api/projects/ngo/empty-ngo-id');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.projects).toHaveLength(0);
  });
});