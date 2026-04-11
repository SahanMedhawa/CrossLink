const fs = require('fs');
const path = require('path');

const defaultInput = path.join(
  __dirname,
  '..',
  'performance',
  'report-participation-latest.json'
);
const defaultOutput = path.join(
  __dirname,
  '..',
  'performance',
  'report-participation-latest.html'
);

const inputPath = path.resolve(process.argv[2] || defaultInput);
const outputPath = path.resolve(process.argv[3] || defaultOutput);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tableRowsFromObject(obj) {
  return Object.entries(obj || {})
    .map(
      ([key, value]) =>
        `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`
    )
    .join('\n');
}

function metricRows(summaries) {
  return Object.entries(summaries || {})
    .map(([name, stats]) => {
      const p50 = stats?.p50 ?? '-';
      const p95 = stats?.p95 ?? '-';
      const p99 = stats?.p99 ?? '-';
      const mean = stats?.mean ?? '-';
      const count = stats?.count ?? '-';
      const min = stats?.min ?? '-';
      const max = stats?.max ?? '-';
      return `<tr>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(count)}</td>
        <td>${escapeHtml(min)}</td>
        <td>${escapeHtml(max)}</td>
        <td>${escapeHtml(mean)}</td>
        <td>${escapeHtml(p50)}</td>
        <td>${escapeHtml(p95)}</td>
        <td>${escapeHtml(p99)}</td>
      </tr>`;
    })
    .join('\n');
}

function buildHtml(report) {
  const aggregate = report?.aggregate || {};
  const counters = aggregate?.counters || {};
  const rates = aggregate?.rates || {};
  const summaries = aggregate?.summaries || {};
  const generatedAt = new Date().toISOString();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CrossLink Performance Report</title>
  <style>
    body { font-family: Segoe UI, Tahoma, Arial, sans-serif; margin: 24px; color: #1f2937; }
    h1, h2 { margin-bottom: 8px; }
    .meta { color: #4b5563; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; font-size: 14px; text-align: left; }
    th { background: #f3f4f6; }
    .section { margin-top: 26px; }
  </style>
</head>
<body>
  <h1>CrossLink Performance Report</h1>
  <p class="meta">Generated: ${escapeHtml(generatedAt)}</p>

  <div class="section">
    <h2>Counters</h2>
    <table>
      <thead><tr><th>Metric</th><th>Value</th></tr></thead>
      <tbody>
        ${tableRowsFromObject(counters)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Rates</h2>
    <table>
      <thead><tr><th>Metric</th><th>Value</th></tr></thead>
      <tbody>
        ${tableRowsFromObject(rates)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Latency Summaries</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Count</th>
          <th>Min</th>
          <th>Max</th>
          <th>Mean</th>
          <th>P50</th>
          <th>P95</th>
          <th>P99</th>
        </tr>
      </thead>
      <tbody>
        ${metricRows(summaries)}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input report not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const report = JSON.parse(raw);
  const html = buildHtml(report);
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`HTML report generated: ${outputPath}`);
}

main();
