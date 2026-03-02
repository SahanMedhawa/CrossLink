// tests/02-fixtures.spec.js
// ============================================================
// FEATURE 2 — FIXTURES & SETUP / TEARDOWN
// Covers: getNGOProjects, getProjectById, updateProject,
//         deleteProject (lifecycle via fixture)
// ============================================================

const { test, expect, SAMPLE_PROJECT } = require('../../fixtures/projectFixtures');
const { ApiStub } = require('../../mocks/projectapimocks');

// ─────────────────────────────────────────────────────────────
// authToken fixture
// ─────────────────────────────────────────────────────────────
test.describe('Fixtures — Auth Token Setup', () => {

  test('FIXTURE 1: authToken fixture provides a valid JWT string', async ({ authToken }) => {
    expect(authToken).toBeTruthy();
    expect(typeof authToken).toBe('string');
    expect(authToken.length).toBeGreaterThan(0);
    console.log(`  Token received (first 20 chars): ${authToken.substring(0, 20)}...`);
  });

  test('FIXTURE 2: NGO and volunteer tokens are different', async ({ authToken, volunteerToken }) => {
    expect(authToken).toBeTruthy();
    expect(volunteerToken).toBeTruthy();
    expect(authToken).not.toBe(volunteerToken);
    console.log('  Two distinct tokens confirmed');
  });
});

// ─────────────────────────────────────────────────────────────
// createdProject fixture — full CRUD lifecycle
// ─────────────────────────────────────────────────────────────
test.describe('Fixtures — Project CRUD Lifecycle', () => {

  test('FIXTURE 3: createdProject fixture sets up a live project', async ({ createdProject }) => {
    expect(createdProject.id).toBeTruthy();
    expect(createdProject.title).toBe(SAMPLE_PROJECT.title);
    expect(createdProject.focusArea).toBe(SAMPLE_PROJECT.focusArea);
    console.log(`  Project ready: ${createdProject.id}`);
    // Teardown: fixture deletes this project automatically after test
  });

  test('FIXTURE 4: getProjectById — fetch project created by fixture', async ({ createdProject }) => {
    const api = new ApiStub();
    api.stub('GET', `/api/projects/${createdProject.id}`, 'getProjectById');

    const res  = await api.get(`/api/projects/${createdProject.id}`);
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.project).toBeTruthy();
    console.log(`  Fetched project: ${createdProject.id}`);
  });

  test('FIXTURE 5: updateProject — update the fixture project title', async ({ authToken, createdProject }) => {
    const api = new ApiStub();
    api.stub('PUT', `/api/projects/${createdProject.id}`, 'updateProject');

    const res  = await api.put(`/api/projects/${createdProject.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { title: 'Beach Cleanup Drive — Updated' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.message).toContain('updated');
    console.log('  Project title updated via NGO credentials');
  });

  test('FIXTURE 6: updateProjectStatus — mark fixture project as completed', async ({ authToken, createdProject }) => {
    const api = new ApiStub();
    api.stub('PATCH', `/api/projects/${createdProject.id}/status`, 'updateStatus');

    const res  = await api.patch(`/api/projects/${createdProject.id}/status`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'completed' },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.project.status).toBe('completed');
    console.log('  Project marked as completed');
  });

  test('FIXTURE 7: deleteProject — owner can delete the fixture project', async ({ authToken, createdProject }) => {
    const api = new ApiStub();
    api.stub('DELETE', `/api/projects/${createdProject.id}`, 'deleteProject');

    const res  = await api.delete(`/api/projects/${createdProject.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Project deleted successfully');
  });
});

// ─────────────────────────────────────────────────────────────
// beforeEach / afterEach — getNGOProjects
// ─────────────────────────────────────────────────────────────
test.describe('Fixtures — getNGOProjects with beforeEach/afterEach', () => {
  let sharedContext = {};

  test.beforeEach(async () => {
    console.log('\n  ── beforeEach: init context ──');
    sharedContext.startTime = Date.now();
    sharedContext.api = new ApiStub();
    sharedContext.ngoId = 'mock-ngo-id-001';
  });

  test.afterEach(async ({}, testInfo) => {
    const ms = Date.now() - sharedContext.startTime;
    console.log(`  ── afterEach: "${testInfo.title}" took ${ms}ms ──`);
    sharedContext = {};
  });

  test('FIXTURE 8: getNGOProjects — returns all projects for an NGO', async () => {
    sharedContext.api.stub('GET', `/api/ngo/${sharedContext.ngoId}/projects`, 'ngoOwnProjects');

    const res  = await sharedContext.api.get(`/api/ngo/${sharedContext.ngoId}/projects`);
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.projects).toHaveLength(3);
    console.log(`  Returned ${body.projects.length} projects for NGO`);
  });

  test('FIXTURE 9: getNGOProjects — fresh stub per test, no cross-test contamination', async () => {
    // Confirm no stubs from previous test bleed over
    expect(sharedContext.api.calls).toHaveLength(0);

    sharedContext.api.stub('GET', `/api/ngo/${sharedContext.ngoId}/projects`, 'ngoOwnProjects');
    await sharedContext.api.get(`/api/ngo/${sharedContext.ngoId}/projects`);

    expect(sharedContext.api.calls).toHaveLength(1);
    console.log('  Fresh ApiStub confirmed — no contamination from previous test');
  });
});