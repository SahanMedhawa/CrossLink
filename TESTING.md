# 🧪 Testing Instructions — CrossLink

← [Back to README](README.md)

---

## Testing Environment Configuration

| Component | Tool | Config File |
|-----------|------|-------------|
| Unit & Integration Tests | Playwright Test | `backend/playwright-tests/playwright.config.js` |
| Performance/Load Tests | Artillery | `backend/performance/artillery-load-test.yml` |
| API Base URL (testing) | — | `http://localhost:5000` |

**Prerequisites for running tests:**
```bash
cd backend
npm install
npx playwright install    # Install Playwright browsers (first time only)
```

Ensure the backend server is running before executing tests:
```bash
npm run dev    # In one terminal
```

---

## Unit Tests

Unit tests validate individual service functions (e.g., matchmaking algorithm) in isolation.

**Location:** `backend/playwright-tests/tests/unit/`

```bash
cd backend
npx playwright test --config=playwright-tests/playwright.config.js playwright-tests/tests/unit/
```

**Test files:**
- `matchmaking.unit.spec.js` — Tests the skill-matching scoring algorithm

---

## Integration Tests

Integration tests verify end-to-end API workflows across multiple endpoints.

**Location:** `backend/playwright-tests/tests/integration/`

```bash
cd backend
npx playwright test --config=playwright-tests/playwright.config.js playwright-tests/tests/integration/
```

**Test files:**
- `participation.integration.spec.js` — Volunteer participation lifecycle
- `volunteer.integration.spec.js` — Volunteer profile and endpoint integration

---

## Module-Specific Tests

Each domain has dedicated test suites covering BDD, assertions, fixtures, mocking, and integration:

```bash
# Project tests
npx playwright test --config=playwright-tests/playwright.config.js playwright-tests/tests/project_test/

# Proposal & Funding tests
npx playwright test --config=playwright-tests/playwright.config.js playwright-tests/tests/proposal_test/

# Volunteer tests
npx playwright test --config=playwright-tests/playwright.config.js playwright-tests/tests/volunteer_test/

# Resource tests
npx playwright test --config=playwright-tests/playwright.config.js playwright-tests/tests/resource_test/
```

---

## Run All Tests At Once

```bash
cd backend
npm test
```

This runs the full Playwright test suite. Results are output to:
- Console (list reporter)
- `backend/playwright-tests/playwright-report/` (HTML report)
- `backend/playwright-tests/test-results/results.json` (JSON report)

---

## Performance / Load Testing

Performance tests are conducted using [Artillery](https://www.artillery.io/) to simulate concurrent API load.

**Setup:**
```bash
cd backend
npm install    # Artillery is in devDependencies
```

**Run public-endpoint load test:**
```bash
npm run perf:public
```

This runs a 4-phase load test:
1. **Warm up** (30s) — 3 requests/sec
2. **Ramp up** (60s) — 5→10 requests/sec
3. **Sustained load** (120s) — 10 requests/sec
4. **Cool down** (30s) — 3 requests/sec

**Generate HTML report:**
```bash
npm run perf:public:report
```

**Run participation-endpoint load test (authenticated):**
```bash
npm run perf:participation:all
```

**Performance test configurations:**

| File | Endpoints Tested |
|------|-----------------|
| `performance/artillery-load-test.yml` | Public project browsing |
| `performance/artillery-participation-load-test.yml` | Volunteer participation workflows |
| `performance/artillery-proposal-load-test.yml` | Corporate proposal endpoints |
| `performance/artillery-resource.yml` | Resource management endpoints |
