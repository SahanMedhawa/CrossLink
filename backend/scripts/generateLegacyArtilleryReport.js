const fs = require('fs');
const path = require('path');

const defaultJson = path.join(
  __dirname,
  '..',
  'performance',
  'report-participation-latest.json'
);
const defaultHtml = path.join(
  __dirname,
  '..',
  'performance',
  'report-participation-latest.html'
);
const defaultTemplate = path.join(
  __dirname,
  '..',
  'performance',
  'report.html'
);

const jsonPath = path.resolve(process.argv[2] || defaultJson);
const outputPath = path.resolve(process.argv[3] || defaultHtml);
const templatePath = path.resolve(process.argv[4] || defaultTemplate);

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON report not found: ${jsonPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.error(`Template report not found: ${templatePath}`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const reportData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Legacy Artillery HTML expects these top-level fields to exist.
  if (!reportData.name) {
    reportData.name = path.basename(jsonPath);
  }
  if (!Array.isArray(reportData.intermediate)) {
    reportData.intermediate = [];
  }
  if (!reportData.aggregate) {
    reportData.aggregate = {};
  }
  reportData.aggregate.counters = reportData.aggregate.counters || {};
  reportData.aggregate.rates = reportData.aggregate.rates || {};
  reportData.aggregate.summaries = reportData.aggregate.summaries || {};

  const reportObjectString = JSON.stringify(reportData, null, 2);

  const startMarker = 'const Report = ';
  const endMarker = '\n    const editor = ace.edit("editor");';

  const startIdx = template.indexOf(startMarker);
  const endIdx = template.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    console.error('Could not find Report block markers in template HTML.');
    process.exit(1);
  }

  const before = template.slice(0, startIdx);
  const after = template.slice(endIdx);
  const injected = `${startMarker}${reportObjectString};`;

  const out = `${before}${injected}${after}`;
  fs.writeFileSync(outputPath, out, 'utf8');

  console.log(`Legacy-style report generated: ${outputPath}`);
}

main();
