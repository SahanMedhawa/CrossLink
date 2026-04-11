const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const axios = require('axios');

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:5000';
const PERF_DIR = path.join(__dirname, '..', 'performance');
const TEMPLATE_PATH = path.join(PERF_DIR, 'artillery-participation-load-test.yml');
const GENERATED_PATH = path.join(PERF_DIR, 'artillery-participation.generated.yml');
const OUTPUT_PATH = path.join(PERF_DIR, 'report-participation-latest.json');

const unique = () => `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

const getTokenFromLogin = (body) => {
  return body?.data?.token || body?.token || body?.crosslink_token || null;
};

async function signupAndLoginNgo(client) {
  const suffix = unique();
  const email = `perf.ngo.${suffix}@example.com`;
  const password = 'TestPass123!';

  await client.post('/api/auth/signup', {
    name: `Perf NGO ${suffix}`,
    email,
    password,
    role: 'ngo',
    organizationName: `Perf NGO Org ${suffix}`,
    registrationNumber: `PERF-REG-${suffix}`,
    focusAreas: ['Environment'],
    location: 'Colombo',
  });

  const loginRes = await client.post('/api/auth/login', {
    email,
    password,
    role: 'ngo',
  });

  const ngoToken = getTokenFromLogin(loginRes.data);
  if (!ngoToken) {
    throw new Error('Failed to extract NGO token from login response.');
  }

  return { ngoToken };
}

async function signupAndLoginVolunteer(client) {
  const suffix = unique();
  const email = `perf.volunteer.${suffix}@example.com`;
  const password = 'TestPass123!';

  await client.post('/api/auth/signup', {
    name: `Perf Volunteer ${suffix}`,
    email,
    password,
    role: 'volunteer',
    skills: ['Teamwork', 'Communication'],
    interests: ['Environment'],
    availability: 'Weekends',
    location: 'Colombo',
  });

  const loginRes = await client.post('/api/auth/login', {
    email,
    password,
    role: 'volunteer',
  });

  const volunteerToken = getTokenFromLogin(loginRes.data);
  if (!volunteerToken) {
    throw new Error('Failed to extract volunteer token from login response.');
  }

  return { volunteerToken };
}

async function createProject(client, ngoToken) {
  const suffix = unique();
  const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const createRes = await client.post(
    '/api/projects',
    {
      title: `Perf Participation Project ${suffix}`,
      description: 'Project used for seeded participation performance testing.',
      skills: ['Teamwork', 'Communication'],
      focusArea: 'Environment',
      location: 'Colombo',
      startDate,
      endDate,
      status: 'active',
      volunteersNeeded: 2000,
    },
    {
      headers: {
        Authorization: `Bearer ${ngoToken}`,
      },
    }
  );

  const projectId = createRes.data?.project?._id;
  if (!projectId) {
    throw new Error('Failed to extract projectId from project creation response.');
  }

  return { projectId };
}

async function createInitialParticipation(client, volunteerToken, projectId) {
  const requestRes = await client.post(
    '/api/participation/request',
    {
      projectId,
      message: `Seeded request ${unique()} with valid volunteer intent text.`,
      experienceSummary: `Seeded experience ${unique()} with prior initiative support.`,
      availabilityConfirmed: true,
      preferredRole: 'Coordinator',
      expectedHours: 8,
    },
    {
      headers: {
        Authorization: `Bearer ${volunteerToken}`,
      },
    }
  );

  const participationId = requestRes.data?.data?._id;
  if (!participationId) {
    throw new Error('Failed to extract participationId from participation request response.');
  }

  return { participationId };
}

function generateConfig({ projectId, ngoToken, participationId, volunteerToken }) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const rendered = template
    .replace(/REPLACE_WITH_ACTIVE_PROJECT_ID/g, projectId)
    .replace(/REPLACE_WITH_NGO_JWT/g, ngoToken)
    .replace(/REPLACE_WITH_REQUESTED_PARTICIPATION_ID/g, participationId)
    .replace(/REPLACE_WITH_VOLUNTEER_JWT_FOR_READS/g, volunteerToken)
    .replace(/REPLACE_WITH_VOLUNTEER_JWT_FOR_REQUESTS/g, volunteerToken);

  fs.writeFileSync(GENERATED_PATH, rendered, 'utf8');
}

function runArtillery() {
  const result = spawnSync(
    'npx',
    ['artillery', 'run', GENERATED_PATH, '-o', OUTPUT_PATH],
    {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..'),
    }
  );

  if (result.status !== 0) {
    throw new Error(`Artillery run failed with exit code ${result.status}.`);
  }
}

async function main() {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
  });

  try {
    console.log(`Seeding performance data using ${BASE_URL} ...`);
    const { ngoToken } = await signupAndLoginNgo(client);
    const { volunteerToken } = await signupAndLoginVolunteer(client);
    const { projectId } = await createProject(client, ngoToken);
    const { participationId } = await createInitialParticipation(
      client,
      volunteerToken,
      projectId
    );

    generateConfig({
      projectId,
      ngoToken,
      participationId,
      volunteerToken,
    });

    console.log('Generated seeded config at performance/artillery-participation.generated.yml');
    console.log('Running Artillery participation suite...');
    runArtillery();
    console.log('Done. Report written to performance/report-participation-latest.json');
  } catch (error) {
    console.error('Performance setup/run failed:', error.message);
    process.exit(1);
  }
}

main();
