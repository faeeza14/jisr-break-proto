import puppeteer from 'puppeteer';

const BASE = 'http://localhost:5173';

const log = (...a) => console.log('•', ...a);
const fail = (msg) => {
  console.error('✗ FAIL:', msg);
  process.exitCode = 1;
};
const ok = (msg) => console.log('✓', msg);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
  }
});
page.on('pageerror', (err) => consoleErrors.push(`[pageerror] ${err.message}`));

try {
  log('navigating to root…');
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => location.pathname.includes('/settings/attendance/shifts'));
  ok('Root → /settings/attendance/shifts redirect works');

  log('navigating to construction preset…');
  await page.goto(BASE + '/settings/attendance/shifts/presets/cc', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');
  const h1 = await page.$eval('h1', (el) => el.textContent);
  if (!h1.includes('Construction')) fail('Header missing Construction');

  // Acceptance #1: red pill with hard violations
  await new Promise((r) => setTimeout(r, 200));
  const headerText = await page.$eval('body', (el) => el.innerText);
  if (headerText.includes('compliance issue')) ok('#1 Red compliance pill renders');
  else fail('#1 No compliance issue text in header');
  if (headerText.includes('Compliance violation')) ok('#1 Violation card renders');
  else fail('#1 No "Compliance violation" card text');
  if (headerText.includes('Apply auto-fix')) ok('#1 Apply auto-fix button present');
  else fail('#1 Apply auto-fix button missing');

  // Acceptance #2: click auto-fix
  log('clicking Apply auto-fix…');
  const buttons = await page.$$('button');
  let clicked = false;
  for (const b of buttons) {
    const t = await b.evaluate((el) => el.textContent);
    if (t && t.trim() === 'Apply auto-fix') {
      await b.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) fail('Could not find Apply auto-fix button to click');
  await new Promise((r) => setTimeout(r, 300));
  const after = await page.$eval('body', (el) => el.innerText);
  if (after.includes('Compliant')) ok('#2 Pill green after auto-fix');
  else fail('#2 Pill not Compliant after auto-fix');
  if (!after.includes('Compliance violation')) ok('#2 Violation card gone after fix');
  else fail('#2 Violation card still present');
  // Verify start time is now 06:00
  const startTime = await page.$eval('input[type="time"][value]', (el) => el.value);
  if (startTime === '06:00') ok('#2 Start time is 06:00');
  else fail(`#2 Start time is ${startTime}, expected 06:00`);

  // Acceptance #3: change date to off-season
  log('changing date to 2026-10-15…');
  const dateInput = await page.$('input[type="date"]');
  await dateInput.click({ clickCount: 3 });
  await dateInput.type('2026-10-15');
  await new Promise((r) => setTimeout(r, 200));
  const offSeason = await page.$eval('body', (el) => el.innerText);
  if (offSeason.includes('Compliant')) ok('#3 Off-season is compliant');
  else fail('#3 Off-season did not show compliant');

  // Reset by reloading
  log('reloading to original state for #4 test…');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 200));

  // Acceptance #4: change environment to indoor
  log('switching env to Indoor…');
  await page.select('select', 'indoor');
  await new Promise((r) => setTimeout(r, 200));
  const indoor = await page.$eval('body', (el) => el.innerText);
  if (indoor.includes('Compliant')) ok('#4 Indoor on Aug 15 is compliant');
  else fail(`#4 Indoor expected Compliant. got: ${indoor.slice(0, 200)}`);

  // Acceptance #9: navigate to policies page
  log('navigating to policies page…');
  await page.goto(BASE + '/settings/attendance/policies', { waitUntil: 'networkidle0' });
  const policies = await page.$eval('body', (el) => el.innerText);
  for (const tab of ['Overtime', 'Break', 'Clock-in window', 'Excuse', 'Punch correction']) {
    if (policies.includes(tab)) ok(`#9 Tab "${tab}" present`);
    else fail(`#9 Missing tab ${tab}`);
  }

  // Acceptance #10: click standard outdoor break policy
  log('clicking Break tab + Standard outdoor row…');
  const breakTabs = await page.$$('button');
  for (const b of breakTabs) {
    const t = (await b.evaluate((el) => el.textContent)) || '';
    if (t.trim().startsWith('Break')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 200));
  await page.click('a[href*="/break/bp1"]');
  await page.waitForSelector('input[type="text"], input:not([type])');
  const bp1 = await page.$eval('body', (el) => el.innerText);
  if (bp1.includes('Standard outdoor')) ok('#10 Break policy detail loads with name');
  else fail('#10 Break policy detail did not load Standard outdoor name');

  // Console error gate
  await new Promise((r) => setTimeout(r, 200));
  const fatal = consoleErrors.filter(
    (e) =>
      !e.includes('Download the React DevTools') &&
      !e.includes('source map') &&
      !e.includes('rsms.me'),
  );
  if (fatal.length === 0) ok('No fatal console errors');
  else {
    console.log('Console issues:');
    fatal.forEach((e) => console.log('  ', e));
    fail('Found console errors (see above)');
  }

  await browser.close();
  if (process.exitCode) {
    console.error('\nSMOKE TEST FAILED');
  } else {
    console.log('\nSMOKE TEST PASSED');
  }
} catch (e) {
  console.error('Test crashed:', e);
  await browser.close();
  process.exit(1);
}
