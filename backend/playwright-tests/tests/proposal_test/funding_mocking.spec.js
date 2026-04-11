const { test, expect } = require('@playwright/test');
const { FundingApiStub, MOCK_RESPONSES } = require('../../mocks/fundingApiMocks');

test.describe('Funding API - Mocking & Stubbing', () => {

  test('MOCK: Create returns fake data without hitting DB', async () => {
    const api = new FundingApiStub();

    // Stub POST /api/funding to return success
    api.stub('POST', '/api/funding', 'createFunding');

    // Call the stubbed endpoint
    const res = await api.post('/api/funding', { data: { amount: 1000 } });

    // Assertions
    expect(res.ok()).toBe(true);
    expect(res.status()).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fundingId || res.body.data._id).toBeDefined();
    console.log('POST /api/funding mocked successfully.');
  });

  test('MOCK: Error Simulation - Server Error', async () => {
    const api = new FundingApiStub();

    // Stub POST /api/funding to return server error
    api.stub('POST', '/api/funding', 'serverError');

    // Call the stubbed endpoint
    const res = await api.post('/api/funding', { data: { amount: 1000 } });

    // Assertions
    expect(res.ok()).toBe(false);
    expect(res.status()).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Server error');
    console.log('POST /api/funding server error simulated successfully.');
  });

});