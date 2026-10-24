import { spawn } from 'node:child_process';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = 'file:///C:/Users/MisterPear/Development/ivf-pregnancy-tracker-gemini/app/index.html';
const userDir = await mkdtemp(join(tmpdir(), 'ivf-chrome-'));
const port = 9333;
const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  `--remote-debugging-port=${port}`, `--user-data-dir=${userDir}`,
  '--remote-allow-origins=*', url
], { stdio: 'ignore' });

const wait = ms => new Promise(r => setTimeout(r, ms));
let ws, msgId = 0;
const pending = new Map();
const errors = [];
const logs = [];

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await res.json();
      const page = pages.find(p => p.type === 'page');
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
        ws.onmessage = ev => {
          const m = JSON.parse(ev.data);
          if (m.id && pending.has(m.id)) {
            const { resolve, reject } = pending.get(m.id);
            pending.delete(m.id);
            if (m.error) reject(new Error(m.error.message)); else resolve(m.result);
          } else if (m.method === 'Runtime.exceptionThrown') {
            errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
          } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
            logs.push(m.params.args.map(a => a.value || a.description).join(' '));
          }
        };
        return;
      }
    } catch (e) {}
    await wait(250);
  }
  throw new Error('Could not connect to Chrome');
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

try {
  await connect();
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');
  await wait(1200);

  const report = [];
  const check = (name, ok, extra = '') => { report.push({ name, ok, extra }); };
  const shot = async (name) => {
    try {
      await mkdir('research/screenshots', { recursive: true });
      const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(`research/screenshots/${name}.png`, Buffer.from(r.data, 'base64'));
    } catch (e) { report.push({ name: 'screenshot ' + name, ok: false, extra: e.message }); }
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  check('onboarding visible', await evalJs(`!document.querySelector('#onboarding').hidden`));
  check('welcome copy', (await evalJs(`document.querySelector('#obBody').innerText`)).includes('Welcome'));
  await shot('01-onboarding-mobile');

  await evalJs(`document.querySelector('[data-action="start-demo"]').click()`);
  await wait(300);
  check('demo banner', await evalJs(`!document.querySelector('#demoBanner').hidden`));
  const todayText = (await evalJs(`document.querySelector('#view-today').innerText`)).toLowerCase();
  check('today rendered', todayText.includes('today\'s one thing') && todayText.includes('medications'));
  check('context shows weeks', todayText.includes('weeks'));
  await shot('02-today-mobile');

  // Mark a med done and confirm the "stop for today" behavior.
  await evalJs(`(() => { const b = document.querySelector('#view-today .med-check'); if (b) b.click(); return true; })()`);
  await wait(250);
  check('med checkoff stops the day', (await evalJs(`document.querySelector('#view-today').innerText`)).toLowerCase().includes('rest of today'));

  await evalJs(`document.querySelector('.bottom-nav [data-view="protocol"]').click()`);
  await wait(200);
  check('protocol view', (await evalJs(`document.querySelector('#view-protocol').innerText`)).includes('Appointment timeline'));
  await shot('04-protocol-mobile');

  await evalJs(`document.querySelector('.bottom-nav [data-view="checkin"]').click()`);
  await wait(200);
  check('checkin form', await evalJs(`!!document.querySelector('#checkinForm')`));
  await shot('05-checkin-mobile');

  await evalJs(`(() => { const c = document.querySelector('#ciSpotting'); c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true})); return true; })()`);
  check('severity panel visible', await evalJs(`!document.querySelector('#spotPanel').hidden`));
  await evalJs(`(() => { const r = document.querySelector('input[name="spotAmount"][value="sp"]'); return true; })()`).catch(() => {});
  await evalJs(`(() => { const r = document.querySelector('input[name="spotAmount"][value="heavy"]'); r.checked = true; document.querySelector('#checkinForm').requestSubmit(); return true; })()`);
  await wait(400);
  check('heavy spotting opens safety', await evalJs(`document.querySelector('#safetyModal').open`));
  check('safety has 911', (await evalJs(`document.querySelector('#safetyBody').innerText`)).includes('911'));
  await evalJs(`document.querySelector('#safetyModal [data-action="close-modal"]').click()`);
  await wait(200);

  await evalJs(`document.querySelector('.bottom-nav [data-view="today"]').click()`);
  await wait(200);
  check('tier2 focus appears', (await evalJs(`document.querySelector('#view-today').innerText`)).includes('Safety'));

  await evalJs(`document.querySelector('[data-action="open-missed"]').click()`);
  await wait(200);
  check('missed modal opens', await evalJs(`document.querySelector('#missedModal').open`));
  check('missed med list', (await evalJs(`document.querySelector('#missedBody').innerText`)).includes('medication'));
  await evalJs(`document.querySelector('#missedModal [data-action="close-modal"]').click()`);
  await wait(200);

  await evalJs(`document.querySelector('[data-action="open-settings"]').click()`);
  await wait(200);
  check('settings opens', await evalJs(`document.querySelector('#settingsModal').open`));
  check('settings has transfer field', await evalJs(`!!document.querySelector('#setTransfer')`));
  await evalJs(`document.querySelector('#settingsModal [data-action="close-modal"]').click()`);
  await wait(200);

  await evalJs(`document.querySelector('.bottom-nav [data-view="baby"]').click()`);
  await wait(200);
  check('baby view', (await evalJs(`document.querySelector('#view-baby').innerText`)).toLowerCase().includes('boy note'));
  const week12 = await evalJs(`(() => { const b = document.querySelector('[data-action="select-week"][data-arg="12"]'); b.click(); return document.querySelector('#view-baby').innerText; })()`);
  check('week 12 caveat', week12.toLowerCase().includes('cannot read sex'));
  await shot('03-baby-mobile');

  await evalJs(`document.querySelector('.sidebar [data-view="learn"]') && document.querySelector('.sidebar [data-view="learn"]').click()`);
  await wait(200);

  // ---- Real-profile flow ----
  await evalJs(`localStorage.clear(); location.reload(); true`);
  await wait(1400);
  check('reload returns to onboarding', await evalJs(`!document.querySelector('#onboarding').hidden`));

  await evalJs(`(() => { const d = document.querySelector('#obTransfer'); d.value = '2026-10-10'; document.querySelector('[data-action="ob-next"]').click(); return true; })()`);
  await wait(150);
  check('onboarding step 2', (await evalJs(`document.querySelector('#obBody').innerText`)).includes('Who do you call'));
  await evalJs(`(() => { document.querySelector('#obClinicPhone').value = '555-010-2222'; document.querySelector('#obAfterPhone').value = '555-010-3333'; document.querySelector('#obClinicName').value = 'Test Clinic'; document.querySelector('[data-action="ob-next"]').click(); return true; })()`);
  await wait(150);
  check('onboarding step 3', (await evalJs(`document.querySelector('#obBody').innerText`)).includes('Your medications'));
  await evalJs(`(() => { const p = document.querySelector('.obMed[value="pio"]'); if (p) p.checked = true; document.querySelector('[data-action="ob-finish"]').click(); return true; })()`);
  await wait(350);

  const realToday = (await evalJs(`document.querySelector('#view-today').innerText`)).toLowerCase();
  check('real profile GA', realToday.includes('4w4d'));
  check('real profile EDD', realToday.includes('jun 28, 2027'));
  check('real profile saved', await evalJs(`!!localStorage.getItem('ivf-tracker-v2')`));
  await shot('06-today-real-mobile');

  // Learn / FAQ reachable
  await evalJs(`document.querySelector('.sidebar [data-action="goto-learn"]').click()`);
  await wait(200);
  check('learn reachable', (await evalJs(`document.querySelector('#view-learn').innerText`)).includes('Is spotting normal after IVF?'));
  check('print block has safety', (await evalJs(`document.querySelector('#printSafety').innerText`)).includes('VERIFY LOCALLY'));

  // Stand-alone fainting routes to Tier 2
  await evalJs(`document.querySelector('.bottom-nav [data-view="checkin"]').click()`);
  await wait(200);
  await evalJs(`(() => { const f = document.querySelector('#ciFainted'); f.checked = true; document.querySelector('#checkinForm').requestSubmit(); return true; })()`);
  await wait(350);
  check('fainting alone opens safety', await evalJs(`document.querySelector('#safetyModal').open`));
  await evalJs(`document.querySelector('#safetyModal [data-action="close-modal"]').click()`);
  await wait(150);

  // Appointment detail
  await evalJs(`document.querySelector('.bottom-nav [data-view="protocol"]').click()`);
  await wait(200);
  await evalJs(`document.querySelector('#view-protocol [data-action="goto-appt"]').click()`);
  await wait(200);
  const apptBody = (await evalJs(`document.querySelector('#apptBody').innerText`)).toLowerCase();
  check('appointment modal', apptBody.includes('what happens'));
  await shot('09-appointment-mobile');
  await evalJs(`document.querySelector('#apptModal [data-action="close-modal"]').click()`);
  await wait(150);

  // Missed PIO flow
  await evalJs(`document.querySelector('#view-protocol [data-action="open-missed"]').click()`);
  await wait(150);
  await evalJs(`(() => { const r = document.querySelector('input[name="missGap"][value="lt2"]'); r.checked = true; document.querySelector('[data-action="missed-continue"]').click(); return true; })()`);
  await wait(150);
  check('missed PIO routes to clinic', (await evalJs(`document.querySelector('#missedBody').innerText`)).toLowerCase().includes('clinic call'));
  await evalJs(`document.querySelector('#missedModal [data-action="close-modal"]').click()`);
  await wait(150);

  // Theme + phone
  await evalJs(`document.querySelector('[data-action="open-settings"]').click()`);
  await wait(150);
  const telHref = await evalJs(`(() => { const s = document.querySelector('#setTheme'); s.value = 'dark'; return true; })()`);
  await evalJs(`document.querySelector('#settingsForm').requestSubmit()`);
  await wait(300);
  check('dark mode applied', await evalJs(`document.documentElement.dataset.theme === 'dark'`));
  await evalJs(`document.querySelector('.nav-safety').click()`);
  await wait(250);
  check('safety has clinic tel link', (await evalJs(`document.querySelector('#safetyBody').innerHTML`)).includes('tel:5550102222'));
  await shot('07-safety-dark-mobile');
  await evalJs(`document.querySelector('#safetyModal [data-action="close-modal"]').click()`);
  await wait(150);

  // 320px pass
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 2, mobile: true });
  await wait(200);
  check('320 no horizontal overflow', await evalJs(`document.documentElement.scrollWidth <= 320`), await evalJs(`document.documentElement.scrollWidth`));
  await shot('08-today-320-dark');

  // Re-entry after 3 silent days
  await evalJs(`(() => { const s = JSON.parse(localStorage.getItem('ivf-tracker-v2')); s.meta.lastOpened = new Date(Date.now() - 3 * 86400000).toISOString(); localStorage.setItem('ivf-tracker-v2', JSON.stringify(s)); location.reload(); return true; })()`);
  await wait(1500);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const reentry = (await evalJs(`document.querySelector('#view-today').innerText`)).toLowerCase();
  check('re-entry card after gap', reentry.includes('welcome back'));
  check('re-entry names last dose', reentry.includes('last recorded hormonal dose'));
  check('390 no horizontal overflow', await evalJs(`document.documentElement.scrollWidth <= 390`));
  await shot('10-reentry-mobile');

  console.log(JSON.stringify({ report, errors, logs, storage: await evalJs(`(() => { try { localStorage.setItem('t','1'); localStorage.removeItem('t'); return true; } catch(e) { return String(e); } })()`) }, null, 2));

  for (const r of report) if (!r.ok) process.exitCode = 1;
} catch (e) {
  console.error('SMOKE FAILED:', e.message);
  console.error(JSON.stringify({ errors, logs }, null, 2));
  process.exitCode = 2;
} finally {
  try { ws && ws.close(); } catch (e) {}
  proc.kill();
  await wait(300);
  try { await rm(userDir, { recursive: true, force: true }); } catch (e) {}
}
