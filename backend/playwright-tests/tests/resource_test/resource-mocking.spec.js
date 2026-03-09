const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/resourceapimocks');  // ✅ Correct import

test.describe('Resource API - Mocking/Stubbing', () => {

  test.describe('Basic API Stubbing', () => {
    
    test('MOCK 1: Should stub successful resource creation', async () => {
      const api = new ApiStub();  // This will now work
      api.stub('POST', '/api/resources', 'createResource');

      const resourceData = {
        projectId: 'mock-project-id',
        name: 'Mock Resource',
        totalQuantity: 100,
        remainingQuantity: 100
      };

      const response = await api.post('/api/resources', { data: resourceData });
      const body = await response.json();

      expect(response.status()).toBe(201);
      expect(body.success).toBe(true);
      expect(body.resource._id).toBe('mock-resource-id-001');
      expect(body.resource.name).toBe(resourceData.name);
      
      expect(api.calls.length).toBe(1);
      expect(api.calls[0].method).toBe('POST');
      expect(api.calls[0].path).toBe('/api/resources');
    });

    test('MOCK 2: Should stub different donation scenarios', async () => {
      const api = new ApiStub();
      
      // Test 1: Successful donation
      api.stub('POST', '/api/resources/proj-123/donate', 'donateResource');
      
      let response = await api.post('/api/resources/proj-123/donate', {
        data: { name: 'Gloves', quantity: 5 }
      });
      let body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(body.message).toContain('success');
      expect(body.remainingQuantity).toBe(45);

      // Test 2: Insufficient quantity
      api.stub('POST', '/api/resources/proj-123/donate', 'donateResourceInsufficient');
      
      response = await api.post('/api/resources/proj-123/donate', {
        data: { name: 'Gloves', quantity: 100 }
      });
      body = await response.json();
      
      expect(response.status()).toBe(400);
      expect(body.message).toContain('Cannot donate');

      // Test 3: Fully funded scenario
      api.stub('POST', '/api/resources/proj-123/donate', 'donateResourceFullyFunded');
      
      response = await api.post('/api/resources/proj-123/donate', {
        data: { name: 'Gloves', quantity: 45 }
      });
      body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(body.isFullyFunded).toBe(true);
      expect(body.remainingQuantity).toBe(0);
    });

    test('MOCK 3: Should stub error scenarios', async () => {
      const api = new ApiStub();

      // Project not found
      api.stub('POST', '/api/resources/invalid/donate', 'projectNotFound');
      let response = await api.post('/api/resources/invalid/donate');
      expect(response.status()).toBe(404);

      // Resource not found in project
      api.stub('POST', '/api/resources/valid/donate', 'resourceNotInProject');
      response = await api.post('/api/resources/valid/donate', {
        data: { name: 'NonExistent' }
      });
      expect(response.status()).toBe(404);

      // Server error
      api.stub('GET', '/api/resources/all', 'serverError');
      response = await api.get('/api/resources/all');
      expect(response.status()).toBe(500);
    });
  });

  test.describe('CRUD Operations with Mocks', () => {
    
    test('MOCK 4: CREATE - Should stub resource creation with validation', async () => {
      const api = new ApiStub();
      
      const scenarios = [
        { data: {}, responseKey: 'validationError', expectedStatus: 400 },
        { data: { name: 'Valid', totalQuantity: -5 }, responseKey: 'validationError', expectedStatus: 400 },
        { data: { name: 'Valid', totalQuantity: 10 }, responseKey: 'createResource', expectedStatus: 201 }
      ];

      for (const scenario of scenarios) {
        api.stub('POST', '/api/resources', scenario.responseKey);
        
        const response = await api.post('/api/resources', { data: scenario.data });
        expect(response.status()).toBe(scenario.expectedStatus);
      }
    });

    test('MOCK 5: READ - Should stub paginated responses', async () => {
      const api = new ApiStub();
      
      api.stub('GET', '/api/resources/all?page=1&limit=2', 'getAllResourcesPage1');
      let response = await api.get('/api/resources/all?page=1&limit=2');
      let body = await response.json();
      expect(body.resources.length).toBe(2);

      api.stub('GET', '/api/resources/all?page=2&limit=2', 'getAllResourcesPage2');
      response = await api.get('/api/resources/all?page=2&limit=2');
      body = await response.json();
      expect(body.resources[0]._id).toBe('mock-resource-id-003');

      api.stub('GET', '/api/resources/all?page=3&limit=2', 'emptyResources');
      response = await api.get('/api/resources/all?page=3&limit=2');
      body = await response.json();
      expect(body.resources.length).toBe(0);
    });

    test('MOCK 6: UPDATE - Should stub different update scenarios', async () => {
      const api = new ApiStub();

      api.stub('PUT', '/api/resources/mock-id', 'updateResource');
      let response = await api.put('/api/resources/mock-id', {
        data: { name: 'Updated Name' }
      });
      let body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.resource.name).toContain('Updated');

      api.stub('PUT', '/api/resources/mock-id', 'forbidden');
      response = await api.put('/api/resources/mock-id');
      expect(response.status()).toBe(403);

      api.stub('PUT', '/api/resources/invalid-id', 'resourceNotFound');
      response = await api.put('/api/resources/invalid-id');
      expect(response.status()).toBe(404);
    });

    test('MOCK 7: DELETE - Should stub deletion scenarios', async () => {
      const api = new ApiStub();

      api.stub('DELETE', '/api/resources/mock-id', 'deleteResource');
      let response = await api.delete('/api/resources/mock-id');
      let body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.success).toBe(true);

      api.stub('DELETE', '/api/resources/mock-id', 'forbidden');
      response = await api.delete('/api/resources/mock-id');
      expect(response.status()).toBe(403);

      api.stub('DELETE', '/api/resources/deleted-id', 'resourceNotFound');
      response = await api.delete('/api/resources/deleted-id');
      expect(response.status()).toBe(404);
    });
  });

  test.describe('Mock Call Tracking', () => {
    
    test('MOCK 8: Should track all API calls', async () => {
      const api = new ApiStub();
      
      api.stub('GET', '/api/resources/all', 'getAllResources');
      api.stub('POST', '/api/resources', 'createResource');
      api.stub('DELETE', '/api/resources/mock-id', 'deleteResource');

      await api.get('/api/resources/all');
      await api.post('/api/resources', { data: { name: 'Test' } });
      await api.delete('/api/resources/mock-id');

      expect(api.calls.length).toBe(3);
      expect(api.calls[0].method).toBe('GET');
      expect(api.calls[1].method).toBe('POST');
      expect(api.calls[2].method).toBe('DELETE');
      
      expect(api.calls[1].data).toBeDefined();
      expect(api.calls[1].data.name).toBe('Test');
    });

    test('MOCK 9: Should stub and track sequential calls', async () => {
      const api = new ApiStub();
      
      api.stub('GET', '/api/resources/1', 'getResourceById');
      
      await api.get('/api/resources/1');
      await api.get('/api/resources/1');
      
      expect(api.calls.length).toBe(2);
      expect(api.calls[0].path).toBe('/api/resources/1');
      expect(api.calls[1].path).toBe('/api/resources/1');
    });
  });
});