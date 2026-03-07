const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/proposalApiMocks');

test.describe('Mocking — Proposal Endpoints', () => {
  
  test('MOCK: Create returns fake data without hitting DB', async () => {
    const api = new ApiStub();
    // STUB: POST /api/proposals
    api.stub('POST', '/api/proposals', 'createProposal');
    
    // CALL: POST /api/proposals
    const res = await api.post('/api/proposals', { data: {} });
    
    expect(res.ok()).toBe(true);
    expect(res.body.data.amount).toBe(5000);
    console.log('  POST /api/proposals mocked successfully.');
  });

  test('MOCK: Update Status simulates NGO acceptance', async () => {
    const api = new ApiStub();
    // STUB: PATCH /api/proposals/mock-prop-001/status
    api.stub('PATCH', '/api/proposals/mock-prop-001/status', 'updateStatusAccepted');
    
    // CALL: PATCH /api/proposals/mock-prop-001/status
    const res = await api.patch('/api/proposals/mock-prop-001/status', { data: { status: 'Accepted' } });
    
    expect(res.status()).toBe(200);
    expect(res.body.data.status).toBe('Accepted');
  });

  test('MOCK: Call Recording verifies payload', async () => {
    const api = new ApiStub();
    api.stub('PUT', '/api/proposals/mock-prop-001', 'updateProposal');
    await api.put('/api/proposals/mock-prop-001', { data: { amount: 9999 } });
    expect(api.calls[0].options.data.amount).toBe(9999);
    console.log('  Payload verification passed.');
  });
});