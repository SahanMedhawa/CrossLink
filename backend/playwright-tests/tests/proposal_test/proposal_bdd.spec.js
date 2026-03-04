const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/proposalApiMocks');

async function given(desc, fn) { console.log(`\n    GIVEN ${desc}`); return fn(); }
async function when(desc, fn) { console.log(`    WHEN  ${desc}`); return fn(); }
async function then(desc, fn) { console.log(`    THEN  ${desc}`); return fn(); }

test.describe('BDD — Corporate Proposal Flow', () => {
  test('Scenario: Corporate creates a proposal', async () => {
    let api, res, body;
    await given('an authenticated Corporate user', async () => {
      api = new ApiStub();
      api.stub('POST', '/api/proposals', 'createProposal');
    });
    await when('the Corporate submits a valid proposal form', async () => {
      res = await api.post('/api/proposals', { data: { proposalTitle: 'Garden' } });
      body = await res.json();
    });
    await then('the API creates the proposal and returns 201', async () => {
      expect(res.status()).toBe(201);
      expect(body.data.status).toBe('Pending');
    });
  });

  test('Scenario: NGO accepts a proposal', async () => {
    let api, res, body;
    await given('a pending proposal exists', async () => {
      api = new ApiStub();
      api.stub('PATCH', '/api/proposals/mock-prop-001/status', 'updateStatusAccepted');
    });
    await when('the NGO updates the status to Accepted', async () => {
      res = await api.patch('/api/proposals/mock-prop-001/status', { data: { status: 'Accepted' } });
      body = await res.json();
    });
    await then('the API confirms the status change', async () => {
      expect(res.status()).toBe(200);
      expect(body.data.status).toBe('Accepted');
    });
  });

  test('Scenario: Corporate deletes their own proposal', async () => {
    let api, res, body;
    await given('a Corporate owns a pending proposal', async () => {
      api = new ApiStub();
      api.stub('DELETE', '/api/proposals/mock-prop-001', 'deleteProposal');
    });
    await when('the Corporate sends a delete request', async () => {
      res = await api.delete('/api/proposals/mock-prop-001');
      body = await res.json();
    });
    await then('the API deletes the proposal and returns success', async () => {
      expect(res.status()).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});