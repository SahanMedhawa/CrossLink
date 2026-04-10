const { test, expect } = require('@playwright/test');

const makeEmail = (prefix) => `${prefix}.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;

const signupUser = async (request, payload) => {
  const res = await request.post('/api/auth/signup', { data: payload });
  const body = await res.json();
  return { res, body };
};

const loginUser = async (request, email, password, role) => {
  const res = await request.post('/api/auth/login', {
    data: { email, password, role },
  });
  const body = await res.json();
  return { res, body };
};

const createProject = async (request, ngoToken, overrides = {}) => {
  const startDate = new Date(Date.now() + 86400000).toISOString();
  const endDate = new Date(Date.now() + 86400000 * 30).toISOString();

  const payload = {
    title: `Participation Integration Project ${Date.now()}`,
    description: 'Project created for participation integration testing.',
    skills: ['Teamwork', 'Communication'],
    focusArea: 'Environment',
    location: 'Colombo',
    startDate,
    endDate,
    status: 'active',
    volunteersNeeded: 2,
    ...overrides,
  };

  const res = await request.post('/api/projects', {
    headers: { Authorization: `Bearer ${ngoToken}` },
    data: payload,
  });
  const body = await res.json();
  return { res, body };
};

test.describe.serial('Integration - Participation CRUD lifecycle', () => {
  test('01. volunteer requests, NGO approves, volunteer cannot edit/withdraw approved request', async ({ request }) => {
    const ngoPassword = 'TestPass123!';
    const volunteerPassword = 'TestPass123!';
    const ngoEmail = makeEmail('ngo.participation');
    const volunteerEmail = makeEmail('volunteer.participation');

    const ngoSignup = await signupUser(request, {
      name: 'NGO Participation Owner',
      email: ngoEmail,
      password: ngoPassword,
      role: 'ngo',
      organizationName: 'Participation Test NGO',
      registrationNumber: `REG-${Date.now()}`,
      focusAreas: ['Environment'],
      location: 'Colombo',
    });
    expect(ngoSignup.res.status()).toBe(201);

    const volunteerSignup = await signupUser(request, {
      name: 'Volunteer Participant',
      email: volunteerEmail,
      password: volunteerPassword,
      role: 'volunteer',
      skills: ['Teamwork', 'Communication'],
      interests: ['Environment'],
      availability: 'Weekends',
      location: 'Colombo',
    });
    expect(volunteerSignup.res.status()).toBe(201);

    const ngoLogin = await loginUser(request, ngoEmail, ngoPassword, 'ngo');
    const volunteerLogin = await loginUser(request, volunteerEmail, volunteerPassword, 'volunteer');

    expect(ngoLogin.res.status()).toBe(200);
    expect(volunteerLogin.res.status()).toBe(200);

    const ngoToken = ngoLogin.body.data.token;
    const volunteerToken = volunteerLogin.body.data.token;

    const projectCreate = await createProject(request, ngoToken);
    expect(projectCreate.res.status()).toBe(201);
    expect(projectCreate.body.success).toBe(true);

    const projectId = projectCreate.body.project._id;
    expect(projectId).toBeTruthy();

    const requestParticipationRes = await request.post('/api/participation/request', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        projectId,
        message: 'I would like to contribute with consistent support.',
        experienceSummary: 'I have helped in multiple local outreach programs before.',
        availabilityConfirmed: true,
        preferredRole: 'Coordinator',
        expectedHours: 8,
      },
    });
    const requestParticipationBody = await requestParticipationRes.json();

    expect(requestParticipationRes.status()).toBe(201);
    expect(requestParticipationBody.success).toBe(true);
    expect(requestParticipationBody.data.status).toBe('requested');

    const participationId = requestParticipationBody.data._id;
    expect(participationId).toBeTruthy();

    const ngoViewVolunteersRes = await request.get(`/api/participation/projects/${projectId}/volunteers`, {
      headers: { Authorization: `Bearer ${ngoToken}` },
    });
    const ngoViewVolunteersBody = await ngoViewVolunteersRes.json();

    expect(ngoViewVolunteersRes.status()).toBe(200);
    expect(ngoViewVolunteersBody.success).toBe(true);
    expect(Array.isArray(ngoViewVolunteersBody.data)).toBe(true);
    expect(ngoViewVolunteersBody.data.some((p) => p._id === participationId)).toBe(true);

    const approveRes = await request.patch(`/api/participation/${participationId}/status`, {
      headers: { Authorization: `Bearer ${ngoToken}` },
      data: { status: 'approved' },
    });
    const approveBody = await approveRes.json();

    expect(approveRes.status()).toBe(200);
    expect(approveBody.success).toBe(true);
    expect(approveBody.data.status).toBe('approved');

    const volunteerEditApprovedRes = await request.patch(`/api/participation/${participationId}`, {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        message: 'Trying to edit approved entry should fail.',
      },
    });
    const volunteerEditApprovedBody = await volunteerEditApprovedRes.json();

    expect(volunteerEditApprovedRes.status()).toBe(403);
    expect(volunteerEditApprovedBody.success).toBe(false);
    expect(volunteerEditApprovedBody.message).toMatch(/cannot edit/i);

    const volunteerDeleteApprovedRes = await request.delete(`/api/participation/${participationId}`, {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const volunteerDeleteApprovedBody = await volunteerDeleteApprovedRes.json();

    expect(volunteerDeleteApprovedRes.status()).toBe(403);
    expect(volunteerDeleteApprovedBody.success).toBe(false);
    expect(volunteerDeleteApprovedBody.message).toMatch(/cannot delete/i);

    const completeRes = await request.patch(`/api/participation/${participationId}/status`, {
      headers: { Authorization: `Bearer ${ngoToken}` },
      data: { status: 'completed' },
    });
    const completeBody = await completeRes.json();

    expect(completeRes.status()).toBe(200);
    expect(completeBody.success).toBe(true);
    expect(completeBody.data.status).toBe('completed');

    const statsRes = await request.get('/api/participation/stats', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const statsBody = await statsRes.json();

    expect(statsRes.status()).toBe(200);
    expect(statsBody.success).toBe(true);
    expect(statsBody.data.completed).toBeGreaterThanOrEqual(1);
    expect(statsBody.data.impactPoints).toBeGreaterThanOrEqual(10);
  });

  test('02. volunteer request can be rejected and remains non-editable', async ({ request }) => {
    const ngoPassword = 'TestPass123!';
    const volunteerPassword = 'TestPass123!';
    const ngoEmail = makeEmail('ngo.reject');
    const volunteerEmail = makeEmail('volunteer.reject');

    const ngoSignup = await signupUser(request, {
      name: 'NGO Reject Owner',
      email: ngoEmail,
      password: ngoPassword,
      role: 'ngo',
      organizationName: 'Reject Test NGO',
      registrationNumber: `REG-${Date.now()}-R`,
      focusAreas: ['Education'],
      location: 'Kandy',
    });
    expect(ngoSignup.res.status()).toBe(201);

    const volunteerSignup = await signupUser(request, {
      name: 'Volunteer Reject Candidate',
      email: volunteerEmail,
      password: volunteerPassword,
      role: 'volunteer',
      skills: ['Mentoring'],
      interests: ['Education'],
      availability: 'Weekdays',
      location: 'Kandy',
    });
    expect(volunteerSignup.res.status()).toBe(201);

    const ngoLogin = await loginUser(request, ngoEmail, ngoPassword, 'ngo');
    const volunteerLogin = await loginUser(request, volunteerEmail, volunteerPassword, 'volunteer');

    expect(ngoLogin.res.status()).toBe(200);
    expect(volunteerLogin.res.status()).toBe(200);

    const ngoToken = ngoLogin.body.data.token;
    const volunteerToken = volunteerLogin.body.data.token;

    const projectCreate = await createProject(request, ngoToken, {
      title: `Reject Flow Project ${Date.now()}`,
      skills: ['Mentoring'],
      volunteersNeeded: 1,
    });

    expect(projectCreate.res.status()).toBe(201);
    const projectId = projectCreate.body.project._id;

    const applyRes = await request.post('/api/participation/request', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        projectId,
        message: 'I am interested in supporting this education project.',
        experienceSummary: 'I have practical tutoring and mentoring experience.',
        availabilityConfirmed: true,
      },
    });
    const applyBody = await applyRes.json();

    expect(applyRes.status()).toBe(201);
    expect(applyBody.success).toBe(true);

    const participationId = applyBody.data._id;

    const rejectRes = await request.patch(`/api/participation/${participationId}/status`, {
      headers: { Authorization: `Bearer ${ngoToken}` },
      data: { status: 'rejected' },
    });
    const rejectBody = await rejectRes.json();

    expect(rejectRes.status()).toBe(200);
    expect(rejectBody.success).toBe(true);
    expect(rejectBody.data.status).toBe('rejected');

    const updateRejectedRes = await request.patch(`/api/participation/${participationId}`, {
      headers: { Authorization: `Bearer ${volunteerToken}` },
      data: {
        message: 'Update after rejection should fail.',
      },
    });
    const updateRejectedBody = await updateRejectedRes.json();

    expect(updateRejectedRes.status()).toBe(403);
    expect(updateRejectedBody.success).toBe(false);
    expect(updateRejectedBody.message).toMatch(/cannot edit/i);

    const withdrawRejectedRes = await request.delete(`/api/participation/${participationId}`, {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const withdrawRejectedBody = await withdrawRejectedRes.json();

    expect(withdrawRejectedRes.status()).toBe(403);
    expect(withdrawRejectedBody.success).toBe(false);
    expect(withdrawRejectedBody.message).toMatch(/cannot delete/i);
  });
});
