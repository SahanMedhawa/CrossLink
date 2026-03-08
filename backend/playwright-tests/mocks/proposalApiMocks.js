// mocks/proposalApiMocks.js

const MOCK_RESPONSES = {
  createProposal: { status: 201, body: { success: true, message: 'Created', data: { _id: 'mock-prop-001', proposalTitle: 'Community Garden Initiative', amount: 5000, status: 'Pending' } } },
  getMyProposals: { status: 200, body: { success: true, count: 1, data: [{ _id: 'mock-prop-001', proposalTitle: 'Garden', status: 'Pending' }] } },
  updateProposal: { status: 200, body: { success: true, message: 'Updated', data: { _id: 'mock-prop-001', proposalTitle: 'Updated', status: 'Pending' } } },
  updateStatusAccepted: { status: 200, body: { success: true, message: 'Accepted', data: { _id: 'mock-prop-001', status: 'Accepted' } } },
  deleteProposal: { status: 200, body: { success: true, message: 'Deleted', data: {} } },
  forbidden: { status: 403, body: { success: false, message: 'Not authorized' } },
  serverError: { status: 500, body: { success: false, message: 'Server Error' } },
};

class ApiStub {
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
    
    let responseKey = this._stubs[key];

    if (!responseKey) {
      console.error(`❌ MOCK NOT FOUND: "${key}"`); //helpful for debugging failures
      console.error(`   Available:`, Object.keys(this._stubs));
      responseKey = 'serverError';
    }

    const mock = MOCK_RESPONSES[responseKey];

    // Fallback if mock definition is missing
    const finalMock = mock || { status: 500, body: { success: false, message: 'Mock config error' } };

    return {
      ok: () => finalMock.status >= 200 && finalMock.status < 300,
      status: () => finalMock.status,
      body: finalMock.body, // <-FIXED! Return body as property
      json: async () => finalMock.body, // And also as function for compatibility
    };
  }

  post(path, opts) { return this._handle('POST', path, opts); }
  get(path, opts) { return this._handle('GET', path, opts); }
  put(path, opts) { return this._handle('PUT', path, opts); }
  patch(path, opts) { return this._handle('PATCH', path, opts); }
  delete(path, opts) { return this._handle('DELETE', path, opts); }
}

module.exports = { MOCK_RESPONSES, ApiStub };