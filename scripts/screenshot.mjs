import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
await page.goto('http://localhost:5173/settings/attendance/shifts/presets/cc', {
  waitUntil: 'networkidle0',
});
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: 'screenshots/preset-detail.png', fullPage: true });
await page.goto('http://localhost:5173/settings/attendance/shifts/settings', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: 'screenshots/shifts-list.png', fullPage: true });
await page.goto('http://localhost:5173/settings/attendance/shifts/templates/new', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: 'screenshots/new-template.png', fullPage: true });
await page.goto('http://localhost:5173/settings/attendance/policies', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 300));
// Click Break tab
const btns = await page.$$('button');
for (const b of btns) {
  const t = (await b.evaluate((el) => el.textContent)) || '';
  if (t.trim().startsWith('Break') && !t.includes('policy')) {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 200));
await page.screenshot({ path: 'screenshots/policies-break.png', fullPage: true });
await browser.close();
console.log('Screenshots saved');
