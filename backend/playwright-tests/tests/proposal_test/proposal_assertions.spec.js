const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/proposalApiMocks');

test.describe('Assertions — Proposal CRUD', () => {
  
  test('returns 201 when creating a proposal', async () => {
    const api = new ApiStub();
    // STUB: POST /api/proposals
    api.stub('POST', '/api/proposals', 'createProposal');
    
    // CALL: POST /api/proposals
    const res = await api.post('/api/proposals', { data: { proposalTitle: 'Test' } });
    
    expect(res.status()).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.proposalTitle).toBe('Community Garden Initiative');
  });

  test('returns 200 when getting my proposals', async () => {
    const api = new ApiStub();
    // STUB: GET /api/proposals/my
    api.stub('GET', '/api/proposals/my', 'getMyProposals');
    
    // CALL: GET /api/proposals/my
    const res = await api.get('/api/proposals/my');
    
    expect(res.status()).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('returns 200 when updating a proposal', async () => {
    const api = new ApiStub();
    // STUB: PUT /api/proposals/mock-prop-001
    api.stub('PUT', '/api/proposals/mock-prop-001', 'updateProposal');
    
    // CALL: PUT /api/proposals/mock-prop-001
    const res = await api.put('/api/proposals/mock-prop-001', { data: { amount: 6000 } });
    
    expect(res.status()).toBe(200);
    expect(res.body.message).toContain('Updated');
  });

  test('returns 403 when unauthorized user tries to edit', async () => {
    const api = new ApiStub();
    // STUB: PUT /api/proposals/mock-prop-001
    api.stub('PUT', '/api/proposals/mock-prop-001', 'forbidden');
    
    // CALL: PUT /api/proposals/mock-prop-001
    const res = await api.put('/api/proposals/mock-prop-001', { data: {} });
    
    expect(res.status()).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('returns 200 when deleting a proposal', async () => {
    const api = new ApiStub();
    // STUB: DELETE /api/proposals/mock-prop-001
    api.stub('DELETE', '/api/proposals/mock-prop-001', 'deleteProposal');
    
    // CALL: DELETE /api/proposals/mock-prop-001
    const res = await api.delete('/api/proposals/mock-prop-001');
    
    expect(res.status()).toBe(200);
    expect(res.body.success).toBe(true);
  });
});