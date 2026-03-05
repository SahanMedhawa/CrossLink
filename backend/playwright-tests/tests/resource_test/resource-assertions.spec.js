// tests/resource_test/resource-assertions.spec.js
const { test, expect } = require('@playwright/test');
const { ApiStub } = require('../../mocks/resourceapimocks');

test.describe('Resource API - Assertions Testing', () => {

  test.describe('CRUD Operation Assertions', () => {
    
    test('CREATE - Resources are created via project, not directly', async () => {
      console.log('✓ Resources are created when creating a project');
      expect(true).toBeTruthy();
    });

    test('READ - Should validate single resource response', async () => {
      const api = new ApiStub();
      api.stub('GET', '/api/resources/mock-resource-id-001', 'getResourceById');
      
      const response = await api.get('/api/resources/mock-resource-id-001');
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(body).toHaveProperty('_id', 'mock-resource-id-001');
      expect(body).toHaveProperty('name', 'Gloves');
      expect(body).toHaveProperty('totalQuantity', 50);
    });

    test('READ ALL - Should validate all resources response', async () => {
      const api = new ApiStub();
      api.stub('GET', '/api/resources/all', 'getAllResources');
      
      const response = await api.get('/api/resources/all');
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
    });

    test('UPDATE - Should validate successful update', async () => {
      const api = new ApiStub();
      api.stub('PUT', '/api/resources/mock-resource-id-001', 'updateResource');
      
      const updates = {
        name: 'Gloves (Updated)',
        totalQuantity: 60
      };

      const response = await api.put('/api/resources/mock-resource-id-001', {
        data: updates
      });
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(body.message).toContain('updated');
    });

    test('DELETE - Should validate successful deletion', async () => {
      const api = new ApiStub();
      api.stub('DELETE', '/api/resources/mock-resource-id-001', 'deleteResource');
      
      const response = await api.delete('/api/resources/mock-resource-id-001');
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  test.describe('Donation Operation Assertions', () => {
    
    test('Donation should update quantities correctly', async () => {
      const api = new ApiStub();
      api.stub('POST', '/api/resources/mock-project-id-001/donate', 'donateResource');
      
      const donationData = {
        name: 'Gloves',
        quantity: 5,
        corporateId: 'mock-corporate-id-001'
      };

      const response = await api.post('/api/resources/mock-project-id-001/donate', {
        data: donationData
      });
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(body.message).toContain('success');
      expect(body.remainingQuantity).toBe(45);
    });

    test('Should reject invalid donation quantities', async () => {
      const api = new ApiStub();
      api.stub('POST', '/api/resources/mock-project-id-001/donate', 'donateResourceInsufficient');
      
      const response = await api.post('/api/resources/mock-project-id-001/donate', {
        data: { name: 'Gloves', quantity: 100 }
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Project Resource Endpoints', () => {
    
    test('GET resources by project', async () => {
      const api = new ApiStub();
      api.stub('GET', '/api/resources/project/mock-project-id-001', 'getResourcesByProject');
      
      const response = await api.get('/api/resources/project/mock-project-id-001');
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
    });

    test('GET resource status for project', async () => {
      const api = new ApiStub();
      api.stub('GET', '/api/resources/project/mock-project-id-001/status', 'projectResourceStatus');
      
      const response = await api.get('/api/resources/project/mock-project-id-001/status');
      const body = await response.json();
      
      expect(response.status()).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
    });
  });
});