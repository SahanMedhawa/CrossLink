// mocks/resourceapimocks.js — Mock responses for resource controller

const MOCK_RESPONSES = {

  // ── createResource ─────────────────────────────────────────
  createResource: {
    status: 201,
    body: {
      success: true,
      message: "Resource created successfully",
      resource: {
        _id: "mock-resource-id-001",
        projectId: "mock-project-id-001",
        name: "Mock Resource",
        totalQuantity: 100,
        remainingQuantity: 100,
        description: "Mock resource description",
        donatedBy: [],
        createdAt: new Date().toISOString()
      }
    }
  },

  // ── donateResource ─────────────────────────────────────────
  donateResource: {
    status: 200,
    body: {
      message: "Donation submitted successfully",
      resource: {
        _id: "mock-resource-id-001",
        projectId: "mock-project-id-001",
        name: "Gloves",
        totalQuantity: 50,
        remainingQuantity: 45,
        description: "Protective gloves for cleanup",
        donatedBy: [
          {
            corporateId: "mock-corporate-id-001",
            quantity: 5,
            donatedAt: new Date().toISOString()
          }
        ]
      },
      projectName: "Beach Cleanup Drive",
      isFullyFunded: false,
      remainingQuantity: 45,
      originalNeed: 50
    }
  },

  donateResourceInsufficient: {
    status: 400,
    body: {
      message: "Cannot donate 100. Only 45 remaining for Gloves"
    }
  },

  donateResourceFullyFunded: {
    status: 200,
    body: {
      message: "Donation submitted successfully",
      resource: {
        _id: "mock-resource-id-001",
        remainingQuantity: 0
      },
      isFullyFunded: true,
      remainingQuantity: 0
    }
  },

  // ── getProjectResourceStatus ───────────────────────────────
  projectResourceStatus: {
    status: 200,
    body: [
      {
        name: "Gloves",
        originalNeed: 50,
        totalDonated: 5,
        remainingNeeded: 45,
        isFullyFunded: false,
        donations: [
          {
            corporateId: "mock-corporate-id-001",
            quantity: 5,
            donatedAt: new Date().toISOString()
          }
        ]
      },
      {
        name: "Trash Bags",
        originalNeed: 100,
        totalDonated: 0,
        remainingNeeded: 100,
        isFullyFunded: false,
        donations: []
      }
    ]
  },

  // ── getAllResources (matches GET /api/resources/all) ───────
  getAllResources: {
    status: 200,
    body: [
      {
        _id: "mock-resource-id-001",
        projectId: {
          _id: "mock-project-id-001",
          title: "Beach Cleanup Drive",
          organizationName: "Helping Hands NGO",
          location: "Colombo, Sri Lanka"
        },
        name: "Gloves",
        totalQuantity: 50,
        remainingQuantity: 45,
        description: "Protective gloves for cleanup",
        donatedBy: [
          {
            corporateId: {
              _id: "mock-corporate-id-001",
              name: "John Doe",
              companyName: "Tech Corp",
              email: "corporate@example.com"
            },
            quantity: 5,
            donatedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        _id: "mock-resource-id-002",
        projectId: {
          _id: "mock-project-id-001",
          title: "Beach Cleanup Drive",
          organizationName: "Helping Hands NGO",
          location: "Colombo, Sri Lanka"
        },
        name: "Trash Bags",
        totalQuantity: 100,
        remainingQuantity: 100,
        description: "Heavy-duty garbage bags",
        donatedBy: [],
        createdAt: new Date().toISOString()
      }
    ]
  },

  // ── Paginated responses ────────────────────────────────────
  getAllResourcesPage1: {
    status: 200,
    body: {
      resources: [
        {
          _id: "mock-resource-id-001",
          name: "Gloves",
          totalQuantity: 50,
          remainingQuantity: 45
        },
        {
          _id: "mock-resource-id-002",
          name: "Trash Bags",
          totalQuantity: 100,
          remainingQuantity: 100
        }
      ],
      total: 3,
      page: 1,
      pages: 2
    }
  },

  getAllResourcesPage2: {
    status: 200,
    body: {
      resources: [
        {
          _id: "mock-resource-id-003",
          name: "Water Bottles",
          totalQuantity: 200,
          remainingQuantity: 200
        }
      ],
      total: 3,
      page: 2,
      pages: 2
    }
  },

  emptyResources: {
    status: 200,  // Fixed: was 500, now 200
    body: {
      resources: [],
      total: 0,
      page: 3,
      pages: 0
    }
  },

  // ── getResourceById ────────────────────────────────────────
  getResourceById: {
    status: 200,
    body: {
      _id: "mock-resource-id-001",
      projectId: {
        _id: "mock-project-id-001",
        title: "Beach Cleanup Drive",
        organizationName: "Helping Hands NGO",
        location: "Colombo, Sri Lanka"
      },
      name: "Gloves",
      totalQuantity: 50,
      remainingQuantity: 45,
      description: "Protective gloves for cleanup",
      donatedBy: [
        {
          corporateId: "mock-corporate-id-001",
          quantity: 5,
          donatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    }
  },

  // ── updateResource ─────────────────────────────────────────
  updateResource: {
    status: 200,
    body: {
      message: "Resource updated successfully",
      resource: {
        _id: "mock-resource-id-001",
        name: "Gloves (Updated)",
        totalQuantity: 60,
        remainingQuantity: 55,
        description: "Updated description"
      }
    }
  },

  // ── deleteResource ─────────────────────────────────────────
  deleteResource: {
    status: 200,
    body: {
      success: true,
      message: "Resource deleted successfully",
      resourceId: "mock-resource-id-001",
      projectResourcePreserved: true
    }
  },

  // ── getResourcesByProject ──────────────────────────────────
  getResourcesByProject: {
    status: 200,
    body: [
      {
        _id: "mock-resource-id-001",
        name: "Gloves",
        totalQuantity: 50,
        remainingQuantity: 45,
        description: "Protective gloves for cleanup",
        donatedBy: [
          {
            corporateId: {
              _id: "mock-corporate-id-001",
              name: "John Doe",
              companyName: "Tech Corp"
            },
            quantity: 5,
            donatedAt: new Date().toISOString()
          }
        ]
      },
      {
        _id: "mock-resource-id-002",
        name: "Trash Bags",
        totalQuantity: 100,
        remainingQuantity: 100,
        description: "Heavy-duty garbage bags",
        donatedBy: []
      }
    ]
  },

  getResourcesByProjectEmpty: {
    status: 200,
    body: []
  },

  // ── getProjectResourceStatus (matches GET /api/resources/project/:projectId/status) ──
  getProjectResourceStatus: {
    status: 200,
    body: [
      {
        name: "Gloves",
        originalNeed: 50,
        totalDonated: 5,
        remainingNeeded: 45,
        isFullyFunded: false,
        donations: [
          {
            corporateId: "mock-corporate-id-001",
            quantity: 5,
            donatedAt: new Date().toISOString()
          }
        ]
      },
      {
        name: "Trash Bags",
        originalNeed: 100,
        totalDonated: 0,
        remainingNeeded: 100,
        isFullyFunded: false,
        donations: []
      }
    ]
  },

  // ── Validation Error response ───────────────────────────────
  validationError: {
    status: 400,
    body: {
      success: false,
      message: "Validation error: totalQuantity must be a positive integer"
    }
  },

  // ── Error responses ────────────────────────────────────────
  projectNotFound: {
    status: 404,
    body: { message: "Project not found" }
  },

  resourceNotFound: {
    status: 404,
    body: { message: "Resource not found" }
  },

  resourceNotInProject: {
    status: 404,
    body: { message: "Resource not found in project" }
  },

  forbidden: {
    status: 403,
    body: { message: "Not authorized" }
  },

  unauthorized: {
    status: 401,
    body: { message: "Authentication required" }
  },

  serverError: {
    status: 500,
    body: { error: "Internal server error" }
  }
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

// ── Enhanced API stub with route helpers for your specific endpoints ──
class ApiStub {
  constructor() {
    this.calls = [];
    this._stubs = {};
  }

  stub(method, path, responseKey) {
    this._stubs[`${method} ${path}`] = responseKey;
    return this;
  }

  // Helper methods for your specific routes
  stubGetAllResources(responseKey = 'getAllResources') {
    return this.stub('GET', '/api/resources/all', responseKey);
  }

  stubGetResourceById(resourceId, responseKey = 'getResourceById') {
    return this.stub('GET', `/api/resources/${resourceId}`, responseKey);
  }

  stubGetResourcesByProject(projectId, responseKey = 'getResourcesByProject') {
    return this.stub('GET', `/api/resources/project/${projectId}`, responseKey);
  }

  stubGetProjectStatus(projectId, responseKey = 'getProjectResourceStatus') {
    return this.stub('GET', `/api/resources/project/${projectId}/status`, responseKey);
  }

  stubDonate(projectId, responseKey = 'donateResource') {
    return this.stub('POST', `/api/resources/${projectId}/donate`, responseKey);
  }

  stubUpdateResource(resourceId, responseKey = 'updateResource') {
    return this.stub('PUT', `/api/resources/${resourceId}`, responseKey);
  }

  stubDeleteResource(resourceId, responseKey = 'deleteResource') {
    return this.stub('DELETE', `/api/resources/${resourceId}`, responseKey);
  }

  async _handle(method, path, options) {
    // Store the call with data extracted for the test
    this.calls.push({ 
      method, 
      path, 
      data: options?.data || null,  // 👈 THIS IS THE KEY FIX
      options: options || {}         // Keep full options for reference
    });
    
    const basePath = path.split('?')[0];
    const responseKey = this._stubs[`${method} ${path}`] || this._stubs[`${method} ${basePath}`];
    
    // Default to serverError if no stub found
    const mock = MOCK_RESPONSES[responseKey] || MOCK_RESPONSES.serverError;
    
    // Log for debugging
    console.log(`[ApiStub] ${method} ${path} → ${responseKey || 'serverError'} (${mock.status})`);
    
    return {
      ok: () => mock.status >= 200 && mock.status < 300,
      status: () => mock.status,
      json: async () => mock.body,
    };
  }

  async post(path, options) { return this._handle('POST', path, options); }
  async get(path, options) { return this._handle('GET', path, options); }
  async patch(path, options) { return this._handle('PATCH', path, options); }
  async put(path, options) { return this._handle('PUT', path, options); }
  async delete(path, options) { return this._handle('DELETE', path, options); }
}

module.exports = { MOCK_RESPONSES, mockRoute, ApiStub };