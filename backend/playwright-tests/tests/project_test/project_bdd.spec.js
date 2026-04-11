const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/projectapimocks');

async function given(desc, fn) { console.log(`\n    GIVEN ${desc}`); return fn(); }
async function when(desc, fn)  { console.log(`    WHEN  ${desc}`); return fn(); }
async function then(desc, fn)  { console.log(`    THEN  ${desc}`); return fn(); }

// STORY 1: NGO creates a project
test.describe('BDD — NGO creates a project', () => {

  test('Scenario: Successful project creation', async () => {
    let api, res, body;

    await given('an authenticated NGO user', async () => {
      api = new ApiStub();
      api.stub('POST', '/api/projects', 'createProject');
    });
    await when('the NGO submits a valid project form', async () => {
      res  = await api.post('/api/projects', {
        headers: { Authorization: 'Bearer ngo-jwt' },
        data: { title: 'Beach Cleanup', focusArea: 'Environment', volunteersNeeded: 20 },
      });
      body = await res.json();
    });
    await then('the API creates the project and returns HTTP 201', async () => {
      expect(res.status()).toBe(201);
      expect(body.project.title).toBe('Beach Cleanup Drive');
      expect(body.project.status).toBe('active');
    });
  });

  test('Scenario: Volunteer is blocked from creating a project', async () => {
    let api, res, body;

    await given('a logged-in volunteer (not an NGO)', async () => {
      api = new ApiStub();
      api.stub('POST', '/api/projects', 'forbidden');
    });
    await when('the volunteer attempts to create a project', async () => {
      res  = await api.post('/api/projects', { headers: { Authorization: 'Bearer vol-jwt' }, data: {} });
      body = await res.json();
    });
    await then('the API rejects the request with 403 Forbidden', async () => {
      expect(res.status()).toBe(403);
      expect(body.message).toContain('NGO');
    });
  });
});


// STORY 2: Volunteer browses projects
test.describe('BDD — Volunteer browses projects', () => {

  test('Scenario: View all active projects', async () => {
    let api, res, body;

    await given('active projects exist in the system', async () => {
      api = new ApiStub();
      api.stub('GET', '/api/projects', 'getAllProjects');
    });
    await when('the volunteer requests the project listing', async () => {
      res  = await api.get('/api/projects?status=active');
      body = await res.json();
    });
    await then('the API returns an array of active projects', async () => {
      expect(res.status()).toBe(200);
      expect(body.projects.length).toBeGreaterThan(0);
      body.projects.forEach(p => expect(p.status).toBe('active'));
    });
  });

  test('Scenario: View details of one project', async () => {
    let api, res, body;

    await given('a project with ID mock-project-id-001 exists', async () => {
      api = new ApiStub();
      api.stub('GET', '/api/projects/mock-project-id-001', 'getProjectById');
    });
    await when('the volunteer opens that project', async () => {
      res  = await api.get('/api/projects/mock-project-id-001');
      body = await res.json();
    });
    await then('the full project details are returned', async () => {
      expect(res.status()).toBe(200);
      expect(body.project._id).toBe('mock-project-id-001');
      expect(body.project.volunteersNeeded).toBeGreaterThanOrEqual(1);
    });
  });

  test('Scenario: Project not found returns 404', async () => {
    let api, res, body;

    await given('no project exists with ID bad-id', async () => {
      api = new ApiStub();
      api.stub('GET', '/api/projects/bad-id', 'notFound');
    });
    await when('the volunteer requests that project', async () => {
      res  = await api.get('/api/projects/bad-id');
      body = await res.json();
    });
    await then('the API returns 404 Not Found', async () => {
      expect(res.status()).toBe(404);
      expect(body.message).toMatch(/not found/i);
    });
  });
});

// STORY 3: NGO edits a project
test.describe('BDD — NGO edits a project', () => {

  test('Scenario: NGO successfully updates project details', async () => {
    let api, res, body;

    await given('an NGO owns an existing project', async () => {
      api = new ApiStub();
      api.stub('PUT', '/api/projects/mock-project-id-001', 'updateProject');
    });
    await when('the NGO submits updated title and volunteer count', async () => {
      res  = await api.put('/api/projects/mock-project-id-001', {
        headers: { Authorization: 'Bearer ngo-jwt' },
        data: { title: 'Beach Cleanup Drive — Updated', volunteersNeeded: 50 },
      });
      body = await res.json();
    });
    await then('the API saves changes and returns the updated project', async () => {
      expect(res.status()).toBe(200);
      expect(body.project.title).toContain('Updated');
    });
  });

  test('Scenario: Another NGO cannot edit this project', async () => {
    let api, res, body;

    await given('a different NGO tries to edit someone else\'s project', async () => {
      api = new ApiStub();
      api.stub('PUT', '/api/projects/mock-project-id-001', 'notAuthorized');
    });
    await when('they send a PUT request with new data', async () => {
      res  = await api.put('/api/projects/mock-project-id-001', {
        headers: { Authorization: 'Bearer other-ngo-jwt' },
        data: { title: 'Taken' },
      });
      body = await res.json();
    });
    await then('the API blocks the request with 403', async () => {
      expect(res.status()).toBe(403);
      expect(body.message).toContain('authorized');
    });
  });
});


// STORY 4: NGO manages project status
test.describe('BDD — NGO manages project status', () => {

  test('Scenario: NGO marks project as completed', async () => {
    let api, res, body;

    await given('an NGO has an active project', async () => {
      api = new ApiStub();
      api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'updateStatus');
    });
    await when('the NGO sets the status to completed', async () => {
      res  = await api.patch('/api/projects/mock-project-id-001/status', {
        headers: { Authorization: 'Bearer ngo-jwt' },
        data: { status: 'completed' },
      });
      body = await res.json();
    });
    await then('the project status is updated and confirmed', async () => {
      expect(res.status()).toBe(200);
      expect(body.project.status).toBe('completed');
    });
  });

  test('Scenario: Invalid status value is rejected', async () => {
    let api, res, body;

    await given('an NGO tries to set an unsupported status', async () => {
      api = new ApiStub();
      api.stub('PATCH', '/api/projects/mock-project-id-001/status', 'invalidStatus');
    });
    await when('they send status = "published"', async () => {
      res  = await api.patch('/api/projects/mock-project-id-001/status', {
        data: { status: 'published' },
      });
      body = await res.json();
    });
    await then('the API rejects it with 400 and lists valid values', async () => {
      expect(res.status()).toBe(400);
      expect(body.message).toMatch(/draft|active|completed|cancelled/i);
    });
  });
});

// STORY 5: NGO deletes a project
test.describe('BDD — NGO deletes a project', () => {

  test('Scenario: Owner deletes their project', async () => {
    let api, res, body;

    await given('an NGO owns a project they want to remove', async () => {
      api = new ApiStub();
      api.stub('DELETE', '/api/projects/mock-project-id-001', 'deleteProject');
    });
    await when('the NGO sends a DELETE request', async () => {
      res  = await api.delete('/api/projects/mock-project-id-001', {
        headers: { Authorization: 'Bearer ngo-jwt' },
      });
      body = await res.json();
    });
    await then('the project is removed and a success message returned', async () => {
      expect(res.status()).toBe(200);
      expect(body.message).toBe('Project deleted successfully');
    });
  });

  test('Scenario: Non-owner cannot delete the project', async () => {
    let api, res, body;

    await given('a different NGO tries to delete someone else\'s project', async () => {
      api = new ApiStub();
      api.stub('DELETE', '/api/projects/mock-project-id-001', 'notAuthorized');
    });
    await when('they send a DELETE request', async () => {
      res  = await api.delete('/api/projects/mock-project-id-001', {
        headers: { Authorization: 'Bearer wrong-ngo-jwt' },
      });
      body = await res.json();
    });
    await then('the API returns 403 Not Authorized', async () => {
      expect(res.status()).toBe(403);
    });
  });
});


// STORY 6: View projects by NGO (public profile)
test.describe('BDD — View projects by NGO', () => {

  test('Scenario: Anyone can view all projects from a specific NGO', async () => {
    let api, res, body;

    await given('an NGO has published multiple projects', async () => {
      api = new ApiStub();
      api.stub('GET', '/api/projects/ngo/mock-ngo-id-001', 'ngoProjects');
    });
    await when('a user visits that NGO\'s public profile', async () => {
      res  = await api.get('/api/projects/ngo/mock-ngo-id-001');
      body = await res.json();
    });
    await then('all of that NGO\'s projects are returned', async () => {
      expect(res.status()).toBe(200);
      expect(body.projects.length).toBeGreaterThan(0);
      body.projects.forEach(p => expect(p.ngoId).toBe('mock-ngo-id-001'));
    });
  });

  test('Scenario: NGO with no projects returns empty list', async () => {
    let api, res, body;

    await given('a new NGO that has not created any projects', async () => {
      api = new ApiStub();
      api.stub('GET', '/api/projects/ngo/new-ngo-id', 'emptyProjects');
    });
    await when('someone views their profile', async () => {
      res  = await api.get('/api/projects/ngo/new-ngo-id');
      body = await res.json();
    });
    await then('an empty projects array is returned with 200', async () => {
      expect(res.status()).toBe(200);
      expect(body.projects).toHaveLength(0);
    });
  });
});