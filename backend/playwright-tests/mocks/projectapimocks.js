// mocks/apiMocks.js — Full mock responses for all controller functions

const MOCK_RESPONSES = {

  // ── createProject ──────────────────────────────────────────
  createProject: {
    status: 201,
    body: {
      success: true,
      message: 'Project created successfully',
      project: {
        _id: 'mock-project-id-001',
        title: 'Beach Cleanup Drive',
        description: 'Monthly cleanup of the local coastline.',
        focusArea: 'Environment',
        location: 'Colombo, Sri Lanka',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        skills: ['Teamwork', 'Physical Fitness'],
        volunteersNeeded: 20,
        status: 'active',
        ngoId: 'mock-ngo-id-001',
        organizationName: 'Helping Hands NGO',
        resources: [],
        createdAt: new Date().toISOString(),
      },
    },
  },

  // ── getAllProjects ──────────────────────────────────────────
  getAllProjects: {
    status: 200,
    body: {
      success: true,
      count: 2,
      projects: [
        { _id: 'mock-project-id-001', title: 'Beach Cleanup Drive',      focusArea: 'Environment', status: 'active', ngoId: 'mock-ngo-id-001' },
        { _id: 'mock-project-id-002', title: 'Tree Planting Initiative',  focusArea: 'Environment', status: 'active', ngoId: 'mock-ngo-id-001' },
      ],
    },
  },

  // ── getProjectById ─────────────────────────────────────────
  getProjectById: {
    status: 200,
    body: {
      success: true,
      project: {
        _id: 'mock-project-id-001',
        title: 'Beach Cleanup Drive',
        focusArea: 'Environment',
        location: 'Colombo, Sri Lanka',
        status: 'active',
        volunteersNeeded: 20,
        ngoId: { _id: 'mock-ngo-id-001', organizationName: 'Helping Hands NGO', email: 'ngo@example.com' },
      },
    },
  },

  // ── updateProject ──────────────────────────────────────────
  updateProject: {
    status: 200,
    body: {
      success: true,
      message: 'Project updated successfully',
      project: { _id: 'mock-project-id-001', title: 'Beach Cleanup Drive — Updated', status: 'active' },
    },
  },

  // ── updateProjectStatus ────────────────────────────────────
  updateStatus: {
    status: 200,
    body: {
      success: true,
      message: 'Project status updated to completed',
      project: { _id: 'mock-project-id-001', status: 'completed' },
    },
  },

  updateStatusCancelled: {
    status: 200,
    body: {
      success: true,
      message: 'Project status updated to cancelled',
      project: { _id: 'mock-project-id-001', status: 'cancelled' },
    },
  },

  invalidStatus: {
    status: 400,
    body: {
      success: false,
      message: 'Invalid status. Must be: draft, active, completed, or cancelled',
    },
  },

  // ── deleteProject ──────────────────────────────────────────
  deleteProject: {
    status: 200,
    body: { success: true, message: 'Project deleted successfully' },
  },

  // ── getProjectsByNGO ───────────────────────────────────────
  ngoProjects: {
    status: 200,
    body: {
      projects: [
        { _id: 'mock-project-id-001', title: 'Beach Cleanup Drive',     ngoId: 'mock-ngo-id-001', status: 'active' },
        { _id: 'mock-project-id-002', title: 'Tree Planting Initiative', ngoId: 'mock-ngo-id-001', status: 'active' },
        { _id: 'mock-project-id-003', title: 'Food Drive',               ngoId: 'mock-ngo-id-001', status: 'completed' },
      ],
    },
  },

  emptyProjects: {
    status: 200,
    body: { projects: [] },
  },

  // ── getNGOProjects (owner view) ────────────────────────────
  ngoOwnProjects: {
    status: 200,
    body: {
      success: true,
      count: 3,
      projects: [
        { _id: 'mock-project-id-001', title: 'Beach Cleanup Drive',     status: 'active' },
        { _id: 'mock-project-id-002', title: 'Tree Planting Initiative', status: 'active' },
        { _id: 'mock-project-id-003', title: 'Food Drive',               status: 'completed' },
      ],
    },
  },

  // ── Error responses ────────────────────────────────────────
  forbidden: {
    status: 403,
    body: { success: false, message: 'Only NGOs can create projects' },
  },

  notAuthorized: {
    status: 403,
    body: { success: false, message: 'Not authorized to update this project' },
  },

  notFound: {
    status: 404,
    body: { success: false, message: 'Project not found' },
  },

  validationError: {
    status: 400,
    body: { success: false, message: 'Invalid volunteersNeeded value. It must be an integer greater than or equal to 1.' },
  },

  serverError: {
    status: 500,
    body: { success: false, message: 'Error creating project', error: 'Internal server error' },
  },
};

// ── page.route() helper ───────────────────────────────────────
async function mockRoute(page, method, urlPattern, responseKey) {
  await page.route(`**${urlPattern}`, (route) => {
    if (route.request().method() !== method) return route.continue();
    const mock = MOCK_RESPONSES[responseKey];
    route.fulfill({
      status: mock.status,
      contentType: 'application/json',
      body: JSON.stringify(mock.body),
    });
  });
}

// ── In-memory API stub ────────────────────────────────────────
class ApiStub {
  constructor() {
    this.calls   = [];
    this._stubs  = {};
  }

  stub(method, path, responseKey) {
    this._stubs[`${method} ${path}`] = responseKey;
    return this;
  }

  async _handle(method, path, options) {
    this.calls.push({ method, path, options });
    const basePath = path.split('?')[0];
    const responseKey = this._stubs[`${method} ${path}`] || this._stubs[`${method} ${basePath}`] || 'serverError';
    const mock = MOCK_RESPONSES[responseKey];
    return {
      ok:     () => mock.status >= 200 && mock.status < 300,
      status: () => mock.status,
      json:   async () => mock.body,
    };
  }

  async post(path, options)   { return this._handle('POST',   path, options); }
  async get(path, options)    { return this._handle('GET',    path, options); }
  async patch(path, options)  { return this._handle('PATCH',  path, options); }
  async put(path, options)    { return this._handle('PUT',    path, options); }
  async delete(path, options) { return this._handle('DELETE', path, options); }
}

module.exports = { MOCK_RESPONSES, mockRoute, ApiStub };