const { test, expect } = require('@playwright/test');
const {
  calculateMatchScore,
  calculateDistance,
} = require('../../../src/services/volunteer_management/matchmaking.service');

test.describe('Unit - Matchmaking helper functions', () => {
  test('calculateMatchScore returns 100 when project has no required skills', async () => {
    const result = calculateMatchScore(['Communication'], []);

    expect(result).toBe(100);
  });

  test('calculateMatchScore performs case-insensitive fuzzy overlap', async () => {
    const volunteerSkills = ['Public Speaking', 'Teamwork', 'Mentoring'];
    const projectSkills = ['speaking', 'Teamwork', 'Leadership'];

    const result = calculateMatchScore(volunteerSkills, projectSkills);

    expect(result.score).toBe(67);
    expect(result.matchedSkills).toEqual(['speaking', 'Teamwork']);
    expect(result.missingSkills).toEqual(['Leadership']);
  });

  test('calculateDistance returns null when one side has no coordinates', async () => {
    const result = calculateDistance([79.8612, 6.9271], null);
    expect(result).toBeNull();
  });

  test('calculateDistance returns 0 for same point', async () => {
    const point = [79.8612, 6.9271];
    const result = calculateDistance(point, point);
    expect(result).toBe(0);
  });

  test('calculateDistance returns realistic km distance for two cities', async () => {
    const colombo = [79.8612, 6.9271];
    const kandy = [80.6337, 7.2906];

    const result = calculateDistance(colombo, kandy);

    expect(result).toBeGreaterThan(80);
    expect(result).toBeLessThan(130);
  });
});
