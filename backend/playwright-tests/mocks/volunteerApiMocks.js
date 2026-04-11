const MOCK_RESPONSES = {
  getVolunteerProfile: {
    status: 200,
    body: {
      success: true,
      data: {
        _id: 'mock-volunteer-id-001',
        name: 'Alice Volunteer',
        email: 'volunteer@example.com',
        userType: 'volunteer',
        phone: '+94770000001',
        location: 'Colombo, Sri Lanka',
        bio: 'Community volunteer focused on youth and environment.',
        skills: ['Teamwork', 'Mentoring', 'Leadership'],
        interests: ['Education', 'Environment'],
        availability: 'Weekends',
        impactPoints: 30,
        projectsJoinedCount: 2,
      },
    },
  },

  updateVolunteerProfile: {
    status: 200,
    body: {
      success: true,
      message: 'Profile updated successfully.',
      data: {
        _id: 'mock-volunteer-id-001',
        name: 'Alice Volunteer Updated',
        userType: 'volunteer',
        location: 'Kandy, Sri Lanka',
        skills: ['Teamwork', 'Public Speaking'],
        interests: ['Education', 'Community'],
        availability: 'Flexible',
      },
    },
  },

  invalidSkills: {
    status: 400,
    body: {
      success: false,
      message: 'Skills must be an array.',
    },
  },

  getMatchedProjects: {
    status: 200,
    body: {
      success: true,
      count: 2,
      data: [
        {
          project: {
            _id: 'mock-project-id-101',
            title: 'Urban Tree Planting',
            description: 'Tree planting across city schools.',
            skills: ['Teamwork', 'Physical Fitness'],
            focusArea: 'Environment',
            location: 'Colombo',
            volunteersNeeded: 25,
            volunteersCount: 10,
            ngo: {
              _id: 'mock-ngo-id-001',
              organizationName: 'Helping Hands NGO',
            },
          },
          matchScore: 90,
          matchedSkills: ['Teamwork'],
          missingSkills: ['Physical Fitness'],
          distance: 4,
          alreadyApplied: null,
          participationId: null,
        },
        {
          project: {
            _id: 'mock-project-id-102',
            title: 'Community Tutoring Drive',
            description: 'Weekend learning support for students.',
            skills: ['Mentoring', 'Communication'],
            focusArea: 'Education',
            location: 'Gampaha',
            volunteersNeeded: 15,
            volunteersCount: 8,
            ngo: {
              _id: 'mock-ngo-id-002',
              organizationName: 'EduCare Network',
            },
          },
          matchScore: 75,
          matchedSkills: ['Mentoring'],
          missingSkills: ['Communication'],
          distance: 18,
          alreadyApplied: 'requested',
          participationId: 'mock-participation-id-201',
        },
      ],
    },
  },

  requestParticipation: {
    status: 201,
    body: {
      success: true,
      message: 'Participation request submitted successfully.',
      data: {
        _id: 'mock-participation-id-201',
        volunteerId: 'mock-volunteer-id-001',
        projectId: 'mock-project-id-101',
        ngoId: 'mock-ngo-id-001',
        status: 'requested',
        message: 'I am excited to contribute to this project.',
        experienceSummary: 'I have 2 years of volunteer community experience.',
        availabilityConfirmed: true,
        preferredRole: 'Coordinator',
        expectedHours: 8,
        appliedAt: new Date().toISOString(),
      },
    },
  },

  requestValidationError: {
    status: 400,
    body: {
      success: false,
      message: 'Motivation message must be at least 10 characters.',
    },
  },

  getMyApplications: {
    status: 200,
    body: {
      success: true,
      count: 2,
      data: [
        {
          _id: 'mock-participation-id-201',
          status: 'requested',
          appliedAt: new Date().toISOString(),
          projectId: {
            _id: 'mock-project-id-101',
            title: 'Urban Tree Planting',
            location: 'Colombo',
            skills: ['Teamwork'],
          },
          ngoId: {
            _id: 'mock-ngo-id-001',
            organizationName: 'Helping Hands NGO',
          },
          message: 'I am excited to contribute to this project.',
          experienceSummary: 'I have 2 years of volunteer community experience.',
          preferredRole: 'Coordinator',
          expectedHours: 8,
        },
        {
          _id: 'mock-participation-id-202',
          status: 'approved',
          appliedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          projectId: {
            _id: 'mock-project-id-102',
            title: 'Community Tutoring Drive',
            location: 'Gampaha',
            skills: ['Mentoring'],
          },
          ngoId: {
            _id: 'mock-ngo-id-002',
            organizationName: 'EduCare Network',
          },
        },
      ],
    },
  },

  updateParticipationRequest: {
    status: 200,
    body: {
      success: true,
      message: 'Participation request updated successfully.',
      data: {
        _id: 'mock-participation-id-201',
        status: 'requested',
        message: 'Updated motivation statement for this project.',
        experienceSummary: 'Updated experience summary with stronger details.',
        expectedHours: 10,
      },
    },
  },

  updateForbidden: {
    status: 403,
    body: {
      success: false,
      message: 'Cannot edit a participation request that has been approved.',
    },
  },

  deleteParticipationRequest: {
    status: 200,
    body: {
      success: true,
      message: 'Participation request withdrawn successfully.',
    },
  },

  deleteForbidden: {
    status: 403,
    body: {
      success: false,
      message: 'Cannot delete a participation request that has been approved.',
    },
  },

  getVolunteerStats: {
    status: 200,
    body: {
      success: true,
      data: {
        projectsJoined: 2,
        impactPoints: 30,
        pending: 1,
        approved: 1,
        completed: 0,
        rejected: 0,
        ngosHelped: 1,
        totalApplications: 2,
      },
    },
  },

  unauthorized: {
    status: 401,
    body: {
      success: false,
      message: 'Unauthorized access.',
    },
  },

  serverError: {
    status: 500,
    body: {
      success: false,
      message: 'Internal server error.',
    },
  },
};

class ApiStub {
  constructor() {
    this.calls = [];
    this._stubs = {};
  }

  stub(method, path, responseKey) {
    this._stubs[`${method.toUpperCase()} ${path}`] = responseKey;
    return this;
  }

  async _handle(method, path, options = {}) {
    this.calls.push({ method, path, options });

    const basePath = path.split('?')[0];
    const exactKey = `${method.toUpperCase()} ${path}`;
    const baseKey = `${method.toUpperCase()} ${basePath}`;
    const responseKey = this._stubs[exactKey] || this._stubs[baseKey] || 'serverError';
    const mock = MOCK_RESPONSES[responseKey] || MOCK_RESPONSES.serverError;

    return {
      ok: () => mock.status >= 200 && mock.status < 300,
      status: () => mock.status,
      json: async () => mock.body,
    };
  }

  async get(path, options) {
    return this._handle('GET', path, options);
  }

  async post(path, options) {
    return this._handle('POST', path, options);
  }

  async put(path, options) {
    return this._handle('PUT', path, options);
  }

  async patch(path, options) {
    return this._handle('PATCH', path, options);
  }

  async delete(path, options) {
    return this._handle('DELETE', path, options);
  }
}

module.exports = {
  MOCK_RESPONSES,
  ApiStub,
};
