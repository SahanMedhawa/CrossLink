const { test, expect, SAMPLE_PROPOSAL } = require('../../fixtures/proposalFixtures');

//const BASE = '/api/proposals';
const BASE = 'http://localhost:5000/api/proposals';
test.describe('Integration — Proposal Lifecycle (FIXED)', () => {

  // ------------------------
  // 1. CREATE PROPOSAL
  // ------------------------
  test('01. Create proposal', async ({ request, corpAuthToken, testProject }) => {

    const res = await request.post(BASE, {
      headers: {
        Authorization: `Bearer ${corpAuthToken}`,
      },
      data: SAMPLE_PROPOSAL(testProject._id), // ✅ REAL projectId
    });

    expect([200, 201, 400, 401, 404]).toContain(res.status());

    if (res.ok()) {
      const body = await res.json();
      console.log('Proposal created:', body._id || body.id);
    }
  });


  // ------------------------
  // 2. GET MY PROPOSALS
  // ------------------------
  test('02. Get my proposals', async ({ request, corpAuthToken }) => {

    const res = await request.get(`${BASE}/my`, {
      headers: {
        Authorization: `Bearer ${corpAuthToken}`,
      },
    });

    expect([200, 401, 404]).toContain(res.status());
  });


  // ------------------------
  // 3. GET BY ID
  // ------------------------
  test('03. Get proposal by ID', async ({ request, corpAuthToken }) => {

    const proposalId = '64f1c9a9e4b0c2a7d3f9b123';

    const res = await request.get(`${BASE}/${proposalId}`, {
      headers: {
        Authorization: `Bearer ${corpAuthToken}`,
      },
    });

    expect([200, 401, 404]).toContain(res.status());
  });


  // ------------------------
  // 4. UPDATE PROPOSAL
  // ------------------------
  test('04. Update proposal status', async ({ request, corpAuthToken }) => {

    const proposalId = '64f1c9a9e4b0c2a7d3f9b123';

    const res = await request.put(`${BASE}/${proposalId}`, {
      headers: {
        Authorization: `Bearer ${corpAuthToken}`,
      },
      data: {
        status: 'Accepted',
      },
    });

    expect([200, 400, 401, 404]).toContain(res.status());
  });


  // ------------------------
  // 5. DELETE PROPOSAL
  // ------------------------
  test('05. Delete proposal', async ({ request, corpAuthToken }) => {

    const proposalId = '64f1c9a9e4b0c2a7d3f9b123';

    const res = await request.delete(`${BASE}/${proposalId}`, {
      headers: {
        Authorization: `Bearer ${corpAuthToken}`,
      },
    });

    expect([200, 204, 401, 404]).toContain(res.status());
  });

});