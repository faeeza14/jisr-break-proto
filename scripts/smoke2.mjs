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
await page.setViewport({ width: 1400, height: 900 });

const consoleErrors = [];
page.on('console', (msg) => {
  const t = msg.text();
  if (t.includes('[BREAK_SAVE]') || t.includes('[AUDIT]')) console.log('  PAGE:', t);
  if (msg.type() === 'error' || msg.type() === 'warning') consoleErrors.push(t);
});
page.on('pageerror', (err) => consoleErrors.push(err.message));

try {
  await page.goto(BASE + '/settings/attendance/shifts/presets/cc', { waitUntil: 'networkidle0' });
  await wait(150);

  // #5: change start time to 14:00 → violation should be 14:00–15:00
  console.log('\n--- #5: start time 14:00 ---');
  const startInput = await page.$('input[type="time"]');
  await startInput.click({ clickCount: 3 });
  await startInput.type('14:00');
  // blur
  await page.keyboard.press('Tab');
  await wait(200);
  const after5 = await page.$eval('body', (el) => el.innerText);
  if (after5.includes('14:00–15:00') || after5.includes('14:00–15:00')) ok('#5 Violation 14:00–15:00 present');
  else fail(`#5 Did not find 14:00–15:00 in body`);

  // Reload for #6
  console.log('\n--- #6: add break flow ---');
  await page.goto(BASE + '/settings/attendance/shifts/presets/cc', { waitUntil: 'networkidle0' });
  await wait(150);
  const allButtons = await page.$$('button');
  let opened = false;
  for (const b of allButtons) {
    const t = (await b.evaluate((el) => el.textContent)) || '';
    if (t.includes('Add break')) {
      await b.click();
      opened = true;
      break;
    }
  }
  if (!opened) fail('#6 Could not find Add break button');
  await wait(300);
  // Find name input in the dialog (BreakSheet)
  const dialog = await page.$('[role="dialog"]');
  if (!dialog) fail('#6 Could not find break dialog');
  const inputs = await dialog.$$('input');
  await inputs[0].click({ clickCount: 3 });
  await inputs[0].type('Coffee break');
  // Save
  const saveBtns = await dialog.$$('button');
  for (const b of saveBtns) {
    const t = (await b.evaluate((el) => el.textContent)) || '';
    if (t.trim() === 'Save break') {
      await b.click();
      break;
    }
  }
  await wait(400);
  const after6 = await page.$eval('body', (el) => el.innerText);
  if (after6.includes('Coffee break')) ok('#6 New break appears in list');
  else {
    const idx = after6.toLowerCase().indexOf('breaks');
    console.log('  DEBUG idx:', idx, 'len:', after6.length);
    console.log('  DEBUG slice:', after6.slice(Math.max(0, idx), Math.max(0, idx) + 600));
    fail(`#6 New break not in list`);
  }

  // #7: change clock-in window dropdown
  console.log('\n--- #7: switch clock-window policy ---');
  const selects = await page.$$('select');
  // Find the clock-window select
  let switched = false;
  for (const s of selects) {
    const opts = await s.$$eval('option', (els) => els.map((e) => ({ v: e.value, t: e.textContent })));
    const isCw = opts.some((o) => o.v === 'cw1') && opts.some((o) => o.v === 'cw2');
    if (isCw) {
      const current = await s.evaluate((el) => el.value);
      const newVal = current === 'cw1' ? 'cw2' : 'cw1';
      await s.select(newVal);
      switched = true;
      break;
    }
  }
  if (switched) {
    await wait(150);
    const after7 = await page.$eval('body', (el) => el.innerText);
    if (after7.includes('Office standard') || after7.includes('15m grace')) ok('#7 Clock-window meta line updated');
    else fail('#7 Meta line did not update');
  } else fail('#7 Could not find clock-window select');

  // #8: Configure ↗ navigates
  console.log('\n--- #8: Configure ↗ navigates ---');
  const links = await page.$$('a[href*="/policies/"]');
  let clickedConfigure = false;
  for (const l of links) {
    const t = (await l.evaluate((el) => el.textContent)) || '';
    if (t.includes('Configure')) {
      await l.click();
      clickedConfigure = true;
      break;
    }
  }
  if (clickedConfigure) {
    await wait(200);
    const url = page.url();
    if (url.includes('/policies/')) ok(`#8 Navigated to ${url.split('/').slice(-2).join('/')}`);
    else fail('#8 Did not navigate to a policy detail');
  } else fail('#8 Could not find a Configure link');

  // #11: edit a break policy and save
  console.log('\n--- #11: edit break policy ---');
  await page.goto(BASE + '/settings/attendance/policies/break/bp1', { waitUntil: 'networkidle0' });
  await wait(150);
  // Locate name input — first text input on this page
  const allInputs = await page.$$('input');
  let nameInput = null;
  for (const inp of allInputs) {
    const v = await inp.evaluate((el) => el.value);
    if (v === 'Standard outdoor') {
      nameInput = inp;
      break;
    }
  }
  if (!nameInput) fail('#11 Did not find name input');
  else {
    await nameInput.click({ clickCount: 3 });
    await nameInput.type('Standard outdoor (edited)');
    // click Save
    const policyBtns = await page.$$('button');
    for (const b of policyBtns) {
      const t = (await b.evaluate((el) => el.textContent)) || '';
      if (t.trim() === 'Save') {
        await b.click();
        break;
      }
    }
    await wait(500);
    const url = page.url();
    if (url.endsWith('/policies')) ok('#11 Returned to policies list');
    else fail(`#11 URL after save: ${url}`);
    // Click the Break tab — landing tab is Overtime by default
    const tabBtns = await page.$$('button');
    for (const b of tabBtns) {
      const t = (await b.evaluate((el) => el.textContent)) || '';
      if (t.trim().startsWith('Break') && !t.includes('policy')) {
        await b.click();
        break;
      }
    }
    await wait(150);
    const listText = await page.$eval('body', (el) => el.innerText);
    if (listText.includes('Standard outdoor (edited)')) ok('#11 Policy name updated in list');
    else {
      console.log('  DEBUG body excerpt:', listText.slice(0, 600));
      fail('#11 Policy name not updated');
    }
  }

  // Console check
  const fatal = consoleErrors.filter(
    (e) => !e.includes('DevTools') && !e.includes('rsms.me') && !e.includes('source map'),
  );
  if (fatal.length === 0) ok('No fatal console errors');
  else fatal.forEach((e) => console.log('  console:', e));
  if (fatal.length > 0) fail('Console errors present');

  await browser.close();
  if (process.exitCode) console.error('\nSMOKE2 FAILED');
  else console.log('\nSMOKE2 PASSED');
} catch (e) {
  console.error('Crashed:', e);
  await browser.close();
  process.exit(1);
}
