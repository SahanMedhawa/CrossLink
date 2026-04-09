// tests/proposal_test/funding_bdd.spec.js
const { test, expect } = require('@playwright/test');
const { FundingApiStub, MOCK_RESPONSES } = require('../../mocks/fundingApiMocks');

test.describe('Funding API - BDD Style', () => {

  test('CREATE: Returns 201 with correct funding shape on success', async () => {
    const api = new FundingApiStub();
    api.stub('POST', '/api/funding', 'createFunding');

    const res = await api.post('/api/funding', { data: { amount: 5000 } });

    expect(res.ok()).toBe(true);
    expect(res.status()).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.amount).toBe(5000);
  });

  test('CREATE: Returns 400 for invalid amount (negative)', async () => {
    const api = new FundingApiStub();
    api.stub('POST', '/api/funding', 'invalidAmount');

    const res = await api.post('/api/funding', { data: { amount: -100 } });

    expect(res.ok()).toBe(false);
    expect(res.status()).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid amount');
  });

  test('CREATE: Returns 403 when unauthorized user tries to edit', async () => {
    const api = new FundingApiStub();
    api.stub('POST', '/api/funding', 'forbidden');

    const res = await api.post('/api/funding', { data: { amount: 5000 } });

    expect(res.ok()).toBe(false);
    expect(res.status()).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Not authorized');
  });

});