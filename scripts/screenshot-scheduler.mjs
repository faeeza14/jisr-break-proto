import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('[console] ' + m.text());
});

await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
await page.goto('http://localhost:5173/settings/attendance/shifts/scheduler', {
  waitUntil: 'networkidle0',
});
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: 'screenshots/scheduler.png', fullPage: true });
// Click an Ahmad/Tuesday Construction crew cell to open the assignment panel
const buttons = await page.$$('button');
let clicked = false;
for (const b of buttons) {
  const t = (await b.evaluate((el) => el.textContent)) || '';
  if (t.includes('Construction') && t.includes('08:')) {
    await b.click();
    clicked = true;
    break;
  }
}
console.log('Clicked construction cell:', clicked);
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: 'screenshots/scheduler-with-panel.png', fullPage: true });

await browser.close();
console.log('Errors:', errors.length, errors);
