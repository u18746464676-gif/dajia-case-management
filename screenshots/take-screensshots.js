const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, 'screenshots');

const pages = [
  { route: '/#/workbench',       name: 'workbench.png' },
  { route: '/#/',               name: 'case-archive.png' },
  { route: '/#/evidence',       name: 'evidence.png' },
  { route: '/#/mail',           name: 'mail.png' },
  { route: '/#/response',       name: 'response.png' },
  { route: '/#/relief',         name: 'relief.png' },
  { route: '/#/finance',        name: 'finance.png' },
  { route: '/#/reminders',      name: 'reminders.png' },
  { route: '/#/templates',      name: 'templates.png' },
  { route: '/#/settings-center',name: 'settings-center.png' },
  { route: '/#/case/new',       name: 'case-new.png' },
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const p of pages) {
    const url = BASE + p.route;
    console.log(`Screenshot: ${p.name} -> ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const filePath = path.join(OUT, p.name);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  -> saved: ${filePath}`);
  }

  // case detail: need a real case ID, just use '#/case/test' as placeholder
  console.log('Screenshot: case-detail.png (placeholder route)');
  await page.goto(BASE + '/#/case/test-id-placeholder', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'case-detail.png'), fullPage: false });
  console.log('  -> done');

  await browser.close();
  console.log('All screenshots done.');
})();
