// mocks/fundingApiMocks.js

const MOCK_RESPONSES = {
  createFunding: {
    status: 201,
    body: {
      success: true,
      message: 'Funding created',
      data: {
        _id: 'mock-fund-001',
        projectId: 'mock-project-123',
        amount: 5000,
        status: 'Completed',
      },
    },
  },

  invalidAmount: {
    status: 400,
    body: {
      success: false,
      message: 'Invalid amount',
    },
  },

  forbidden: {
    status: 403,
    body: {
      success: false,
      message: 'Not authorized',
    },
  },

  serverError: {
    status: 500,
    body: {
      success: false,
      message: 'Server error',
    },
  },
};

class FundingApiStub {
  constructor() {
    this.calls = [];
    this._stubs = {};
  }

  stub(method, path, responseKey) {
    const key = method.toUpperCase() + ' ' + path;
    this._stubs[key] = responseKey;
    return this;
  }

  async _handle(method, path, options) {
    this.calls.push({ method, path, options });

    const key = method.toUpperCase() + ' ' + path;
    let responseKey = this._stubs[key] || 'serverError';

    const mock =
      MOCK_RESPONSES[responseKey] ||
      { status: 500, body: { success: false, message: 'Mock config error' } };

    return {
      ok: () => mock.status >= 200 && mock.status < 300,
      status: () => mock.status,
      body: mock.body,
      json: async () => mock.body,
    };
  }

  post(path, opts) { return this._handle('POST', path, opts); }
  get(path, opts) { return this._handle('GET', path, opts); }
  patch(path, opts) { return this._handle('PATCH', path, opts); }
  put(path, opts) { return this._handle('PUT', path, opts); }
  delete(path, opts) { return this._handle('DELETE', path, opts); }
}

module.exports = { FundingApiStub, MOCK_RESPONSES };