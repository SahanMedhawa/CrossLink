const { test, expect } = require('@playwright/test');

const buildEmail = (prefix) => `${prefix}.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;

const signup = async (request, payload) => {
  const response = await request.post('/api/auth/signup', { data: payload });
  const body = await response.json();
  return { response, body };
};

const login = async (request, email, password, role) => {
  const response = await request.post('/api/auth/login', {
    data: { email, password, role },
  });
  const body = await response.json();
  return { response, body };
};

test.describe.serial('Integration - Volunteer management and matchmaking', () => {
  let volunteerToken;
  let volunteerId;

  test('01. volunteer profile CRUD plus matchmaking endpoint', async ({ request }) => {
    const volunteerPassword = 'TestPass123!';
    const volunteerEmail = buildEmail('volunteer.integration');

    const signupResult = await signup(request, {
      name: 'Volunteer Integration User',
      email: volunteerEmail,
      password: volunteerPassword,
      role: 'volunteer',
      skills: ['Teamwork', 'Mentoring'],
      interests: ['Education'],
      availability: 'Weekends',
      location: 'Colombo',
    });

    expect(signupResult.response.status()).toBe(201);
    expect(signupResult.body.success).toBe(true);
    expect(signupResult.body.data.user.userType).toBe('volunteer');

    const loginResult = await login(request, volunteerEmail, volunteerPassword, 'volunteer');
    expect(loginResult.response.status()).toBe(200);
    expect(loginResult.body.success).toBe(true);

    volunteerToken = loginResult.body.data.token;
    expect(typeof volunteerToken).toBe('string');

    const getProfileResponse = await request.get('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const getProfileBody = await getProfileResponse.json();

    expect(getProfileResponse.status()).toBe(200);
    expect(getProfileBody.success).toBe(true);
    expect(getProfileBody.data.userType).toBe('volunteer');

    volunteerId = getProfileBody.data._id;
    expect(volunteerId).toBeTruthy();

    const updateProfileResponse = await request.put('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        name: 'Volunteer Integration Updated',
        location: 'Kandy',
        skills: ['Leadership', 'Communication'],
        interests: ['Environment', 'Education'],
        coordinates: {
          type: 'Point',
          coordinates: [80.6337, 7.2906],
        },
      },
    });
    const updateProfileBody = await updateProfileResponse.json();

    expect(updateProfileResponse.status()).toBe(200);
    expect(updateProfileBody.success).toBe(true);
    expect(updateProfileBody.data.name).toBe('Volunteer Integration Updated');
    expect(updateProfileBody.data.skills).toEqual(['Leadership', 'Communication']);

    const invalidProfileResponse = await request.put('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        skills: 'not-json',
      },
    });
    const invalidProfileBody = await invalidProfileResponse.json();

    expect(invalidProfileResponse.status()).toBe(400);
    expect(invalidProfileBody.success).toBe(false);
    expect(invalidProfileBody.message).toMatch(/invalid skills format/i);

    const publicProfileResponse = await request.get(`/api/volunteer/${volunteerId}`, {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const publicProfileBody = await publicProfileResponse.json();

    expect(publicProfileResponse.status()).toBe(200);
    expect(publicProfileBody.success).toBe(true);
    expect(publicProfileBody.data.userType).toBe('volunteer');

    const matchmakingResponse = await request.get('/api/matchmaking/projects', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const matchmakingBody = await matchmakingResponse.json();

    expect(matchmakingResponse.status()).toBe(200);
    expect(matchmakingBody.success).toBe(true);
    expect(Array.isArray(matchmakingBody.data)).toBe(true);
    expect(matchmakingBody.count).toBe(matchmakingBody.data.length);

    const deleteResponse = await request.delete('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const deleteBody = await deleteResponse.json();

    expect(deleteResponse.status()).toBe(200);
    expect(deleteBody.success).toBe(true);
    expect(deleteBody.message).toMatch(/deleted successfully/i);

    const afterDeleteResponse = await request.get('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const afterDeleteBody = await afterDeleteResponse.json();

    expect(afterDeleteResponse.status()).toBe(403);
    expect(afterDeleteBody.success).toBe(false);
    expect(afterDeleteBody.message).toMatch(/access denied\. user not found/i);
  });

  test('02. non-volunteer cannot access volunteer-only endpoints and auth is required', async ({ request }) => {
    const ngoPassword = 'TestPass123!';
    const ngoEmail = buildEmail('ngo.integration');

    const ngoSignupResult = await signup(request, {
      name: 'NGO Integration User',
      email: ngoEmail,
      password: ngoPassword,
      role: 'ngo',
      organizationName: 'NGO Integration Org',
      registrationNumber: `REG-${Date.now()}`,
      focusAreas: ['Environment'],
      location: 'Colombo',
    });

    expect(ngoSignupResult.response.status()).toBe(201);
    expect(ngoSignupResult.body.success).toBe(true);
    expect(ngoSignupResult.body.data.user.userType).toBe('ngo');

    const ngoLoginResult = await login(request, ngoEmail, ngoPassword, 'ngo');
    expect(ngoLoginResult.response.status()).toBe(200);
    expect(ngoLoginResult.body.success).toBe(true);

    const ngoToken = ngoLoginResult.body.data.token;

    const forbiddenVolunteerProfileResponse = await request.get('/api/volunteer/profile', {
      headers: { Authorization: `Bearer ${ngoToken}` },
    });
    const forbiddenVolunteerProfileBody = await forbiddenVolunteerProfileResponse.json();

    expect(forbiddenVolunteerProfileResponse.status()).toBe(403);
    expect(forbiddenVolunteerProfileBody.success).toBe(false);
    expect(forbiddenVolunteerProfileBody.message).toMatch(/volunteer privileges required/i);

    const unauthorizedPublicProfileResponse = await request.get(`/api/volunteer/${volunteerId}`);
    const unauthorizedPublicProfileBody = await unauthorizedPublicProfileResponse.json();

    expect(unauthorizedPublicProfileResponse.status()).toBe(401);
    expect(unauthorizedPublicProfileBody.success).toBe(false);
    expect(unauthorizedPublicProfileBody.message).toMatch(/no token provided/i);
  });
});
