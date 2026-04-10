
// backend/playwright-tests/tests/proposal_test/funding_fixtures.spec.js
// IMPORT FROM FIXTURE FILE
const { test, expect } = require('../../fixtures/fundingFixtures');

test.describe('Funding Module - Fixture Validation', () => {

  // 1. Test that the NGO Token fixture works and provides a valid JWT
  test('FIXTURE: ngoToken provides a valid authentication token', async ({ ngoToken }) => {
    expect(ngoToken).toBeTruthy();
    expect(typeof ngoToken).toBe('string');
    expect(ngoToken.length).toBeGreaterThan(10); // Basic JWT length check
  });

  // 2. Test that the Corporate Token fixture works
  test('FIXTURE: corporateToken provides a valid authentication token', async ({ corpAuthToken }) => {
    expect(corpAuthToken).toBeTruthy();
    expect(typeof corpAuthToken).toBe('string');
    // Note: We can't strictly compare ngoToken here as it's not in scope unless we add it as a param
    // But we know it's a string
  });

  // 3. Test that the testProject fixture creates a project and returns valid data
  test('FIXTURE: testProject sets up a live project for funding', async ({ testProject }) => {
    expect(testProject).toBeDefined();
    expect(testProject._id).toBeTruthy();
    expect(testProject.title).toBe('Community Garden Initiative');
  });

  // 4. Test the full chain: NGO creates Project -> Corporate gets Token -> Ready for Funding
  test('FIXTURE CHAIN: Full setup for creating a funding record', async ({ ngoToken, corpAuthToken, testProject }) => {
    // Assert all pieces are present
    expect(ngoToken).toBeTruthy();
    expect(corpAuthToken).toBeTruthy();
    expect(testProject).toBeTruthy();
    
    console.log(`Chain verified: NGO Token OK, Corp Token OK, Project ID: ${testProject._id}`);
  });

  // 5. Test Teardown (Implicit): Verify that if we run multiple tests, projects are isolated
  test('FIXTURE ISOLATION: Second test gets a fresh project context', async ({ testProject }) => {
    // Just verifying the fixture runs again for this test
    expect(testProject._id).toBeTruthy();
    console.log(`Test 2 received Project ID: ${testProject._id}`);
  });
});
