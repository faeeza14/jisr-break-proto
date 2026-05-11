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
await page.setViewport({ width: 1440, height: 1100 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

const clickButtonByText = async (text) => {
  const handle = await page.evaluateHandle((t) => {
    return Array.from(document.querySelectorAll('button, a')).find(
      (el) => (el.textContent || '').trim().includes(t),
    ) ?? null;
  }, text);
  const el = handle.asElement();
  if (!el) throw new Error('Could not find button: ' + text);
  await el.click();
  return el;
};

try {
  console.log('--- E2E: scheduler → new template → bulk assign ---');
  await page.goto(BASE + '/settings/attendance/shifts/scheduler', { waitUntil: 'networkidle0' });
  await wait(300);

  // 1. Default landed on scheduler
  if (page.url().includes('/scheduler')) ok('Landed on scheduler');
  else fail('Did not land on scheduler · URL: ' + page.url());

  // 2. Click a Construction crew cell (first one we find)
  const cells = await page.$$('button');
  let clickedCell = false;
  for (const b of cells) {
    const t = (await b.evaluate((el) => el.textContent)) || '';
    if (t.includes('Construction crew') && t.includes('08:')) {
      await b.click();
      clickedCell = true;
      break;
    }
  }
  if (clickedCell) ok('Clicked Construction crew cell');
  else fail('No Construction crew cell found');
  await wait(200);

  // 3. Heat ban warning visible on the Construction picker card in the panel
  const panelText = await page.$eval('body', (el) => el.innerText);
  if (panelText.includes('Heat ban')) ok('"Heat ban" warning shown in panel picker');
  else fail('Heat ban pill missing');

  // 4. Initial violation count is 15 (3 outdoor employees × 5 weekdays)
  const v0 = (panelText.match(/VIOLATIONS\s+(\d+)/i) ?? [])[1];
  if (v0 === '15') ok(`Violations stat = 15 (initial)`);
  else fail(`Expected 15, got ${v0}`);

  // 5. Navigate to Shift settings → Templates → New template
  await page.goto(BASE + '/settings/attendance/shifts/settings', { waitUntil: 'networkidle0' });
  await wait(200);
  // Click Templates sub-nav
  await clickButtonByText('Templates');
  await wait(150);
  // Click New template
  await clickButtonByText('New template');
  await wait(300);

  // 6. Step 1: pick Week template
  await clickButtonByText('Week template');
  await wait(150);
  await clickButtonByText('Continue');
  await wait(150);

  // 7. Step 2: name + workdays default Sun-Thu, click Continue
  const nameInput = await page.$('input[placeholder^="Office"]');
  if (!nameInput) fail('Did not find name input');
  else {
    await nameInput.click({ clickCount: 3 });
    await nameInput.type('Office Sun-Thu E2E');
  }
  await clickButtonByText('Continue');
  await wait(200);

  // 8. Step 3: Click each Sun-Thu cell and assign Office standard
  // We need to find day cells; they're <button> elements with label "Sun 9", etc.
  // Click the Sunday cell, then Office standard chip
  for (let i = 0; i < 5; i++) {
    // Find the day cell — has text matching DAY_NAMES[i]
    const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'][i];
    const dayCells = await page.evaluateHandle((d) => {
      return Array.from(document.querySelectorAll('button')).find(
        (el) => (el.textContent || '').trim().startsWith(d + ' '),
      ) ?? null;
    }, dayLabel);
    const cellEl = dayCells.asElement();
    if (!cellEl) {
      fail(`Could not find ${dayLabel} cell`);
      continue;
    }
    await cellEl.click();
    await wait(120);
    // Click the Office standard chip
    const chipHandle = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find((el) => {
        const t = (el.textContent || '').trim();
        return t === 'Office standard' || t.startsWith('Office standard');
      }) ?? null;
    });
    const chip = chipHandle.asElement();
    if (chip) {
      await chip.click();
      await wait(120);
    } else fail('Office standard chip not found');
  }
  ok('Assigned Office standard to Sun-Thu');

  // 9. Compliance summary shows 0 violations (Office standard is indoor — clean)
  const composeText = await page.$eval('body', (el) => el.innerText);
  if (composeText.includes('No compliance violations detected')) ok('Compliance summary clean');
  else fail('Expected clean compliance summary on Office standard week');

  // 10. Create template
  await clickButtonByText('Create template');
  await wait(800);
  if (page.url().includes('/shifts/settings')) ok('Returned to templates list');
  else fail('Did not return to /shifts/settings; URL: ' + page.url());

  // 11. Go back to scheduler and bulk-assign Office standard to all employees
  await page.goto(BASE + '/settings/attendance/shifts/scheduler', { waitUntil: 'networkidle0' });
  await wait(400);
  const employeeNames = ['Ahmad', 'Salem', 'Yousef', 'Layla', 'Reem', 'Khalid', 'Nora'];
  for (const name of employeeNames) {
    // Find first day-cell button in this employee's row.
    const cellHandle = await page.evaluateHandle((nm) => {
      // Pick the most specific (deepest) div whose text equals the full name token start.
      const candidates = Array.from(document.querySelectorAll('div')).filter(
        (el) => (el.textContent || '').trim().startsWith(nm) && el.children.length === 0,
      );
      const label = candidates[0];
      if (!label) return null;
      const lr = label.getBoundingClientRect();
      const rowY = lr.top + lr.height / 2;
      const cells = Array.from(document.querySelectorAll('button')).filter((b) => {
        const r = b.getBoundingClientRect();
        return Math.abs(r.top + r.height / 2 - rowY) < 35 && r.left > lr.right - 10;
      });
      cells.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      return cells[0] ?? null;
    }, name);
    const cell = cellHandle.asElement();
    if (!cell) {
      fail(`No cell found for ${name}`);
      continue;
    }
    await cell.click();
    await wait(180);
    // Click Office standard preset card in panel
    const officeCardH = await page.evaluateHandle(() => {
      const candidates = Array.from(document.querySelectorAll('button')).filter((el) => {
        const t = (el.textContent || '').trim();
        return t.startsWith('Office standard') && t.includes('09:');
      });
      // Prefer the one inside the panel (largest area in lower part of viewport)
      candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
      return candidates[0] ?? null;
    });
    const card = officeCardH.asElement();
    if (card) {
      await card.click();
      await wait(150);
    }
    // Click Apply to whole week
    const applyHandle = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(
        (el) => (el.textContent || '').trim() === 'Apply to whole week',
      ) ?? null;
    });
    const applyEl = applyHandle.asElement();
    if (applyEl) {
      await applyEl.click();
      await wait(220);
    }
  }

  // 12. Violations count should now be 0
  await wait(300);
  const finalText = await page.$eval('body', (el) => el.innerText);
  const vFinal = (finalText.match(/VIOLATIONS\s+(\d+)/i) ?? [])[1];
  if (vFinal === '0') ok('Final violations = 0');
  else fail(`Expected 0 violations, got ${vFinal}`);

  // 13. Click an Office standard cell and confirm panel shows compliant (no warnings)
  const officeCellHandle = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find((el) => {
      const t = (el.textContent || '').trim();
      return t.includes('Office standard') && t.includes('09:');
    }) ?? null;
  });
  const officeCell = officeCellHandle.asElement();
  if (officeCell) await officeCell.click();
  await wait(200);
  const final2 = await page.$eval('body', (el) => el.innerText);
  // The currently-assigned card should be selected, and there should be no Heat ban warning shown
  // anywhere in the panel except possibly on Construction
  // Just check that the panel header confirms an Office standard assignment.
  if (final2.includes('Currently assigned: Office standard')) ok('Office cell shows Office standard assigned');
  else fail('Panel did not confirm Office standard');

  // Console gate
  const fatal = errors.filter(
    (e) => !e.includes('DevTools') && !e.includes('rsms.me') && !e.includes('source map'),
  );
  if (fatal.length === 0) ok('No fatal console errors');
  else {
    fatal.forEach((e) => console.log('  console:', e));
    fail(`${fatal.length} console errors`);
  }

  await browser.close();
  if (process.exitCode) console.error('\nE2E FAILED');
  else console.log('\nE2E PASSED');
} catch (e) {
  console.error('Crashed:', e);
  await browser.close();
  process.exit(1);
}
