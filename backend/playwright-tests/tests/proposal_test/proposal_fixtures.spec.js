const { test, expect, SAMPLE_PROPOSAL } = require('../../fixtures/proposalFixtures');
const { ApiStub } = require('../../mocks/proposalApiMocks');

test.describe('Fixtures — Proposal Lifecycle', () => {
  test('FIXTURE: corpAuthToken provides a valid token', async ({ corpAuthToken }) => {
    expect(corpAuthToken).toBeTruthy();
    expect(typeof corpAuthToken).toBe('string');
    console.log(`  Token received: ${corpAuthToken.substring(0, 15)}...`);
  });

  test('FIXTURE: Simulate Create and Delete lifecycle', async ({ corpAuthToken }) => {
    const api = new ApiStub();
    api.stub('POST', '/api/proposals', 'createProposal');
    api.stub('DELETE', '/api/proposals/mock-prop-001', 'deleteProposal');

    const createRes = await api.post('/api/proposals', {
      headers: { Authorization: `Bearer ${corpAuthToken}` },
      data: SAMPLE_PROPOSAL,
    });
    expect(createRes.status()).toBe(201);

    const deleteRes = await api.delete('/api/proposals/mock-prop-001', {
      headers: { Authorization: `Bearer ${corpAuthToken}` },
    });
    expect(deleteRes.status()).toBe(200);
    
    console.log('  Lifecycle complete: Created then Deleted.');
  });
});