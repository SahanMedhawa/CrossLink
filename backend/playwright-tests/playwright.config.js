const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directory where tests live
  testDir: './tests',

  // Run all tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left
  forbidOnly: !!process.env.CI,

  // Retry failing tests once on CI
  retries: process.env.CI ? 1 : 0,

  // Limit parallel workers
  workers: process.env.CI ? 1 : undefined,

  // ── FEATURE 3: TEST REPORTING ──────────────────────────────
  // Multiple reporters: human-readable list + HTML report
  reporter: [
    ['list'],                             // console output
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    // Base URL for all API requests (change to your server URL)
    baseURL: 'http://localhost:5000',

    // Collect traces on failure for debugging
    trace: 'on',

    // Extra HTTP headers sent with every request
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  // Test projects — run same suite against different environments
  projects: [
    {
      name: 'API – Development',
      use: { baseURL: 'http://localhost:5000' },
    }
  ],
});