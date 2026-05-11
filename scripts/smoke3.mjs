import puppeteer from 'puppeteer';

const BASE = 'http://localhost:5173';
const ok = (m) => console.log('✓', m);
const fail = (m) => {
  console.error('✗', m);
  process.exitCode = 1;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox'],
});

const page = await browser.newPage();
const consoleEvents = { errors: [], audits: [] };
page.on('console', (msg) => {
  const t = msg.text();
  if (t.includes('[AUDIT]')) consoleEvents.audits.push(t);
  if (msg.type() === 'error' || msg.type() === 'warning') consoleEvents.errors.push(t);
});
page.on('pageerror', (e) => consoleEvents.errors.push(e.message));

try {
  // --- Override modal + audit log
  console.log('--- Override modal flow ---');
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto(BASE + '/settings/attendance/shifts/presets/cc', { waitUntil: 'networkidle0' });
  await wait(150);
  const buttons = await page.$$('button');
  let clickedOverride = false;
  for (const b of buttons) {
    const t = (await b.evaluate((el) => el.textContent)) || '';
    if (t.includes('Override') && t.includes('audit logged')) {
      await b.click();
      clickedOverride = true;
      break;
    }
  }
  if (!clickedOverride) fail('Could not find Override button');
  await wait(200);
  // The override modal should open
  const modal = await page.$('[role="dialog"]');
  if (modal) ok('Override modal opens');
  else fail('Override modal did not open');
  // Type a reason
  const textarea = await page.$('[role="dialog"] textarea');
  await textarea.type('Critical project deadline; manager approved exception.');
  // Click Confirm
  const modalBtns = await modal.$$('button');
  for (const b of modalBtns) {
    const t = (await b.evaluate((el) => el.textContent)) || '';
    if (t.includes('Confirm override')) {
      await b.click();
      break;
    }
  }
  await wait(200);
  if (consoleEvents.audits.length > 0) ok('Audit entry logged to console');
  else fail('No audit log line captured');
  const bodyAfter = await page.$eval('body', (el) => el.innerText);
  if (bodyAfter.includes('overridden')) ok('Banner shows violations overridden');
  else fail('Override banner not shown');

  // --- Mobile drawer
  console.log('--- Mobile (narrow viewport) ---');
  await page.setViewport({ width: 390, height: 800 });
  await page.goto(BASE + '/settings/attendance/shifts', { waitUntil: 'networkidle0' });
  await wait(150);
  // The aside (sidebar) should be hidden on mobile
  const sidebarVisible = await page.$eval('main', (el) => {
    const aside = document.querySelector('aside');
    if (!aside) return false;
    const style = window.getComputedStyle(aside);
    return style.display !== 'none';
  });
  if (!sidebarVisible) ok('Sidebar hidden on mobile (drawer mode)');
  else fail('Sidebar visible on mobile (should be hidden)');
  // Open the drawer
  const menuBtn = await page.$('button[aria-label="Open menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await wait(150);
    const drawerVisible = await page.evaluate(() => {
      const dialog = document.querySelector('aside, [role="navigation"]');
      return !!dialog;
    });
    if (drawerVisible) ok('Drawer opens on menu click');
    else fail('Drawer did not open');
  } else fail('No menu button in mobile topbar');

  // --- Dark mode
  console.log('--- Dark mode ---');
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto(BASE + '/settings/attendance/shifts/presets/cc', { waitUntil: 'networkidle0' });
  await wait(150);
  const themeBtn = await page.$('button[aria-label="Toggle theme"]');
  await themeBtn.click();
  await wait(150);
  const isDark = await page.$eval('html', (el) => el.classList.contains('dark'));
  if (isDark) ok('Dark class applied to html');
  else fail('Dark mode not applied');
  // Body background should change
  const bg = await page.$eval('body', (el) => window.getComputedStyle(el).backgroundColor);
  console.log('  Body bg in dark:', bg);
  // Toggle back
  await themeBtn.click();

  const fatal = consoleEvents.errors.filter(
    (e) => !e.includes('DevTools') && !e.includes('rsms.me') && !e.includes('source map') && !e.includes('puppeteer'),
  );
  if (fatal.length === 0) ok('No fatal console errors');
  else {
    fatal.forEach((e) => console.log('  console:', e));
    fail(`Found ${fatal.length} console errors`);
  }

  await browser.close();
  if (process.exitCode) console.error('\nSMOKE3 FAILED');
  else console.log('\nSMOKE3 PASSED');
} catch (e) {
  console.error('Crashed:', e);
  await browser.close();
  process.exit(1);
}
