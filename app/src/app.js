'use strict';

/* ============================================================
   After the Transfer — offline single-file app
   No network calls. No analytics. localStorage only.
   ============================================================ */

const KEY = 'ivf-tracker-v2';
const APP_VERSION = '2.0';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const I = {
  heart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/></svg>',
  pill: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="m8.5 15.5 7-7"/></svg>',
  drop: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z"/></svg>',
  check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>',
  alert: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2Z"/></svg>',
  calendar: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  edit: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14 6 4 4"/></svg>',
  print: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
  download: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>',
  info: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
};

const CALM_LINES = [
  'Around 8–12 weeks your placenta takes over the progesterone job — the taper happens then, and only on your RE\'s call.',
  'This is exactly the stretch where healthy pregnancies progress uneventfully.',
  'Symptoms go quiet for healthy pregnancies and loud for unhealthy ones — symptoms don\'t grade this. Your scans do.',
  'One beta number isn\'t the story; the trend is. Your clinic is watching the whole trend, not today.',
  'Ultrasound thresholds are deliberately conservative — built so a healthy pregnancy is never declared failed by mistake.',
  'Mild, both-sided, period-like cramps come from the uterus stretching. One-sided or severe is what the call exists for.',
  'You\'re allowed to feel excited and scared at the same time. Both belong here.',
  'The anxiety you carry comes from real history — it isn\'t evidence about today.',
  'On second-trimester scans, "testes not descended yet" is the normal finding. Descent happens later.',
  'Testosterone ramping around weeks 8–12 is a boy milestone — a quiet one; the baby never notices.',
  'An unremarkable day is still a good day. Most of this journey is quiet.',
  'Clinics differ on timing all the time. Yours does it the right way for you.'
];

const BABY_WEEKS = [
  { week: 5, size: 'Poppy seed', length: '~2 mm', body: 'The neural tube is closing; the heart is starting as a simple tube. Your embryo is genetically XY already — but at this size, there is no visible difference between boy and girl. Nothing to see; everything to build.', boy: '', focus: 'Rest is productive this week.', caveat: 'Nothing is scannable yet — first scans run from 6w0d.' },
  { week: 6, size: 'Lentil', length: '~4 mm', body: 'The heart starts beating — most often visible around 6w0d–6w3d on an early scan. Arm and leg buds appear. The gonad is still "bi-potential" at this point, able to go either way.', boy: 'None visible — the Y chromosome is working, but the hardware hasn\'t differentiated.', focus: 'Book the scan date; that\'s the whole job.', caveat: 'A 6-week scan often cannot give a final answer. Indeterminate findings are followed, never declared.' },
  { week: 7, size: 'Blueberry', length: '~1 cm', body: 'The brain is growing fast; arm and leg paddles now.', boy: 'The milestone week: the SRY gene on the Y chromosome activates in the gonad during weeks 6–7 and points it toward becoming a testis. Sertoli cells begin forming.', focus: 'The first 12 weeks are the organ-building window.', caveat: '' },
  { week: 8, size: 'Raspberry', length: '~1.6 cm', body: 'Fingers and toes are beginning; movement starts (not felt yet by you).', boy: 'The testis starts making its first testosterone — low, then ramping.', focus: 'Profound fatigue is normal and hormone-driven. Naps are a clinical intervention, not a weakness.', caveat: '' },
  { week: 9, size: 'Grape', length: '~2.3 cm', body: 'Essential organs have all begun forming. The tail is regressing.', boy: 'Testosterone is climbing toward its first-trimester peak (weeks ~8–12).', focus: 'The "why am I still on shots" feeling peaks around here. The taper is your RE\'s call, not an app default.', caveat: '' },
  { week: 10, size: 'Kumquat', length: '~3.1 cm', body: 'Officially a fetus at the end of this week. Fingernails appear; kidneys begin making urine.', boy: 'Testosterone peaks around weeks 8–12 and drives the Wolffian ducts into epididymis, vas deferens, and seminal vesicles; DHT shapes external anatomy.', focus: 'This is the NIPT window opening (from 10 weeks). Ask the clinic which panel they use.', caveat: 'NIPT is a screen, not a diagnosis.' },
  { week: 11, size: 'Fig', length: '~4.1 cm', body: 'Head is about half the body — normal. Hearing structures are developing.', boy: 'Testosterone peaks then begins falling back; DHT turns the genital tubercle toward a penis and fuses the folds into a scrotum.', focus: 'The progesterone-taper emails from other apps are not your protocol. Yours is in weeks 10–12 territory, per your RE.', caveat: '' },
  { week: 12, size: 'Lime', length: '~5.4 cm', body: 'Liver and kidneys are functioning; the risk of miscarriage drops meaningfully once a heartbeat is confirmed and keeps falling with each week.', boy: 'External genitalia are largely formed by ~12–13 weeks — but you cannot read sex from an ultrasound this week. Not at any accurate level, and especially not via a "nub" guess. NIPT is where "boy" comes from right now; the 18–22-week anatomy scan is the confirmation.', focus: 'If relatives ask for a "12-week gender scan," hand them NIPT\'s reliability instead.', caveat: 'Sex is not readable on ultrasound this week. The anatomy scan confirms at 18–22 weeks.' },
  { week: 13, size: 'Peach', length: '~7.4 cm (CRL this week)', body: 'Vocal cords are forming; the intestines finish moving back into the abdomen.', boy: '', focus: 'End of trimester one — tally it up honestly: what got you through, who helped, what to keep.', caveat: 'Charts switch to head-to-heel measurements soon.' },
  { week: 14, size: 'Lemon', length: '~8.7 cm head-to-heel', body: 'Squinting, frowning, making grasping motions; facial muscles are working. Measurements switch from crown–rump to head-to-heel from here.', boy: 'Sex-differentiated external genitalia are usually visually identifiable on scan from ~14 weeks onward — but seeing it isn\'t the purpose of any scan you\'ll get.', focus: 'First-trimester growth is remarkably steady (gestational age in days ≈ crown–rump length in mm + 42). Known-stability facts help on edgy days.', caveat: '' },
  { week: 15, size: 'Apple', length: '~10.1 cm', body: 'Light comes through closed eyelids; the skeleton hardens from cartilage to bone.', boy: '', focus: 'Normal bodily changes (aching back, growing appetite, round ligament twinges) start here — all standard.', caveat: '' },
  { week: 16, size: 'Avocado', length: '~11.6 cm', body: 'Hearing is developing (muffled); first movements may be felt soon — usually 17–20 weeks for first pregnancies.', boy: '', focus: 'Book a telehealth or a brief check-in if a scan is still far ahead and quiet days are heavy.', caveat: '' },
  { week: 17, size: 'Pear', length: '~13 cm', body: 'Cartilage keeps turning to bone; practicing "breathing" amniotic fluid.', boy: '', focus: 'Second-trimester energy usually returns — spend it deliberately.', caveat: '' },
  { week: 18, size: 'Bell pepper', length: '~14.2 cm', body: 'Yawning, hiccuping; ears reach their anatomical position. The anatomy-scan window opens (18–22 weeks).', boy: 'On the scan, you\'ll likely see penis and scrotum identified; the testes will be described as inside the abdomen — completely normal at this stage; descent completes in the third trimester, sometimes even after birth.', focus: 'Ask whether your clinic will do the anatomy scan at 18 or 20 — both are in-window.', caveat: '' },
  { week: 19, size: 'Mango', length: '~15.3 cm', body: 'Vernix (a waxy coating) is starting; hearing is sharper.', boy: '', focus: 'A support person at the anatomy scan changes the experience — plan it now.', caveat: '' },
  { week: 20, size: 'Banana', length: '~16.4 cm', body: 'Halfway point. The anatomy scan often happens here.', boy: 'The standard second-trimester reading for a boy: visible male genitalia, intra-abdominal testes, occasionally some scrotal fluid (hydrocele) — all expected and usually self-resolving before or shortly after birth.', focus: 'If anything on the scan needs a second look, that\'s the norm for anatomy scans — thousands get re-checked without drama.', caveat: 'The anatomy scan is the visual confirmation of what NIPT predicted.' },
  { week: 21, size: 'Carrot', length: '~26.7 cm', body: 'Swallowing more amniotic fluid; rapid eye movements begin.', boy: '', focus: 'Sleep on either side is fine — left-side optimization is a third-trimester thing.', caveat: '' },
  { week: 22, size: 'Papaya', length: '~27.8 cm (~11 in)', body: 'Looks like a tiny newborn proportionally; sense of touch is well developed. Viability outside the womb becomes possible from ~22–24 weeks with intensive NICU support — a biologic fact, not a promise.', boy: '', focus: 'If your clinic says you\'re past 22 weeks, your OB is leading now.', caveat: 'Your OB is leading from here.' }
];

const FAQS = [
  { q: 'Is spotting normal after IVF?', a: 'About 20–30% of pregnancies have some first-trimester bleeding. IVF adds implantation and medication-related spotting to the mix. Most bleeding does not mean the pregnancy is failing. But the clinic wants a call for any spotting — light or brown — every time. That rule is not scaremongering: it is how clinics catch the serious causes early while routinely reassuring on the common ones. Soaking a pad in an hour, passing clots or tissue, or feeling dizzy → the ER list, now, not tomorrow.', call: 'Call your clinic if you see any blood at all — the harmless-looking kind included.' },
  { q: 'Are mild cramps normal?', a: 'Mild, on-and-off, both-sided, period-like cramping is common from the uterus stretching. Severe pain, one-sided pain, or pain with a shoulder-tip ache is not — that pattern is the ER list. Moderate-but-not-one-sided pain gets a same-day call. Dizziness or fainting with any of it → ER. Nothing here is about how much you can tolerate — it is a plain pattern map.', call: 'Call your clinic if the cramps are new or different, moderately bad, or you just can\'t tell. Uncertainty counts.' },
  { q: 'What if I have no symptoms at all?', a: 'Symptoms do not read the pregnancy. Around 70–80% of pregnant people get nausea, which leaves 20–30% who don\'t — and healthy pregnancies land on both sides. Absence of nausea is not a sign of loss. The one asymmetry worth knowing: a long-established symptom suddenly going silent is worth a phone call, not an ER trip. Either way, don\'t track "am I still nauseous?" as a health metric.', call: 'Call your clinic if an established symptom vanished abruptly and you can\'t set it down.' },
  { q: 'When do I stop progesterone?', a: 'Most clinics stop or taper between 8–12 weeks, once the placenta has taken over. Some taper (alternate days, or half dose, then stop); some stop outright; vaginal progesterone sometimes runs a bit longer than PIO. There are legitimate differences and high-risk exceptions that go longer. Stopping is always the RE\'s decision — timed to your protocol, never a do-it-yourself taper. After a stop, light cramping or spotting can occur from withdrawal — expected, and still always report any bleeding.', call: 'Call your clinic if you are within a week of your set stop date and haven\'t confirmed the plan.' },
  { q: 'What does a beta number actually mean?', a: 'hCG roughly doubles every 48–72 hours very early on, then the pace naturally slows. Minimum expected rise in 48 hours depends on the starting level: about 53% when low, ~49% under 1,500, ~40% from 1,500–3,000, ~33% above 3,000. Past ~6,000–10,000, doubling time stops being meaningful and ultrasound takes over. A single number cannot distinguish inside from outside the uterus, and a great single beta does not rule anything out — the trend is the unit of information.', call: 'Call your clinic if a result confuses you. Reading it aloud to a nurse is cheaper than Googling it.' },
  { q: 'When is my first scan, and what if there\'s no heartbeat yet?', a: 'Typically 6w0d–6w6d, sometimes later. They look for the sac, yolk sac, fetal pole, and cardiac activity — in that order. The thresholds are deliberately conservative: a CRL of ≥7 mm with no heartbeat, or a mean sac of ≥25 mm with no embryo, are diagnostic; anything smaller-and-quiet is suspicious, which means a rescan in 7–14 days — that is the designed plan, not limbo. The thresholds were set specifically so a healthy pregnancy is never mistakenly called a failure.', call: 'Call your clinic if the appointment was indeterminate and no follow-up scan got scheduled.' },
  { q: 'Is it definitely a boy? When will I see it?', a: 'NIPT looks for Y-chromosome DNA fragments from the placenta. From 10 weeks with adequate fetal fraction, the male call is right roughly 98–99% of the time — excellent, but still a screen, not a certainty. First-trimester ultrasound cannot reliably distinguish genitalia, and a "12-week nub" guess isn\'t a method. The 18–22-week anatomy scan is the visual confirmation, and it is the same scan that checks all the organs.', call: 'Call your clinic if you want to know what a specific NIPT phrasing on your report means.' },
  { q: 'What does the anatomy scan check for a boy?', a: 'Two things: normal anatomy everywhere, and — confirming what NIPT said — penis and scrotum, visibly. Two boy-specific findings that sound alarming and aren\'t: testes inside the abdomen at 18–22 weeks (they normally descend in the third trimester, sometimes even after birth), and a little scrotal fluid (hydrocele), which usually resolves before or shortly after birth. Your sonographer may note either; both are in-normal-range findings.', call: 'Call your clinic if the report wording confuses you — the exact phrasing matters, and your OB reads it in context.' },
  { q: 'How does the RE-to-OB handoff work — and why do I feel dumped?', a: 'Graduation is typically 8–10 (sometimes 8–12) weeks, once the heartbeat is confirmed, often on two scans. It is a records handoff: a last scan, the medication taper plan, your dating. Your RE doesn\'t disappear — many stay reachable; ask. The "abandoned" feeling after graduation is real and common among pregnancy-after-IVF patients. It has nothing to do with the quality of either clinic; it is the end of a very supported period, and the new support structure hasn\'t warmed up yet.', call: 'Call your clinic if graduation is close and nobody has told you what week it is or what gets sent.' },
  { q: 'Do I need pelvic rest, and until when?', a: 'Pelvic rest means nothing in the vagina — no intercourse, no tampons — and for many protocols no orgasm at all. It is not universally required after IVF. Clinics prescribe it variously: none after the transfer week, 1–2 weeks until a heartbeat, or until bleeding resolves. If you are on vaginal progesterone, do not stop it because of pelvic rest; ask your RE exactly how to give it. The only honest source is your RE. Bladder pressure, non-sexual daily activity, and household stress are not pelvic-rest issues.', call: 'Call your clinic if you are not sure whether you are on it. Ask; don\'t guess in either direction.' },
  { q: 'What can\'t I eat or drink? What\'s my caffeine limit?', a: 'Avoid unpasteurized anything and soft cheeses from unpasteurized milk; deli/cold cuts and hot dogs unless reheated to steaming; refrigerated pâté and smoked fish unless cooked into a dish; raw sprouts; runny eggs and raw dough; raw/rare meat; liver and high-dose vitamin A; shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, orange roughy; herbal supplements before clearing them; alcohol — zero is the safe amount. Limit albacore tuna to ~6 oz a week. Caffeine: ≤200 mg/day — roughly one 12-oz coffee.', call: 'Call your clinic if you are mid-consumption and worried. Realistically, that is a next-visit question, not an emergency.' },
  { q: 'Is my anxiety "too much," and what do I do at 2 a.m.?', a: 'Roughly 1 in 5 pregnant women experience clinically significant anxiety, and IVF patients start higher. It isn\'t a character flaw; it is a physiologically loaded condition with real treatment options — CBT-based therapy has the best evidence, and medication is a genuine option for many. Panic, inability to function, or scary intrusive thoughts are medical events, not personality notes. The 988 lifeline serves pregnant people too. At 2 a.m.: open Safety, text your scan partner, write the worst case once, and pick tomorrow\'s worry-window slot.', call: 'Call your clinic if you are unable to work, eat, or sleep because of it. That is a same-day conversation, not a white-knuckle one.' }
];

const APPT_SPECS = [
  { id: 'beta1', label: 'Beta hCG #1', offset: 10, window: '9–11 days post-transfer', what: 'A blood draw for a single hCG value. Some clinics run a day-7/8 preliminary; most don\'t.', tells: 'Whether hCG is present and roughly how it compares with your clinic\'s starting threshold — many use about 50–100 mIU/mL as encouraging.', cant: 'One number alone tells much less than the trend. A strong single beta doesn\'t rule out an ectopic, and a low first one doesn\'t doom anything.', prep: 'Eat and drink normally. Ask: "Will you draw again, and when — and when do you stop betas?"', after: 'The number will come with a second one 48 hours later. Try writing both on one line and judging the pair — that\'s the honest unit of information.' },
  { id: 'beta2', label: 'Beta hCG #2', offset: 12, window: '48 hours after beta #1', what: 'A repeat hCG blood draw.', tells: 'The trend, which is what actually matters at this stage. At low starting values, at least about a 53% rise in 48 hours is the well-validated minimum; the required rise gets smaller at higher levels.', cant: 'It still can\'t reliably distinguish inside the uterus from outside — only ultrasound can. Slower-than-expected rises happen in about 1% of viable pregnancies.', prep: 'Same instructions as draw one. Ask: "What level do we stop drawing and switch to scan?"', after: 'If the numbers are slower than hoped, that is a "we follow up" signal, not a verdict.' },
  { id: 'scan1', label: 'First ultrasound', offset: 26, window: '6w0d–6w6d typical', what: 'A transvaginal ultrasound, about 10 minutes. They look for the gestational sac, yolk sac, fetal pole, and cardiac activity — in that order; all four rarely appear at once at exactly 6w0d.', tells: 'Location (inside vs. outside the uterus), measurable growth, and whether a heartbeat is visible yet.', cant: 'A single 6-week scan often can\'t give a final answer. Thresholds are deliberately conservative — set so a healthy pregnancy is never accidentally declared failed. When something is suspicious but not diagnostic, the standard is to rescan 7–14 days later. Indeterminate findings get followed, never declared.', prep: 'Come with a full-ish bladder if asked. Bring a support person if allowed. Write your top question down. Ask: "Is there any preparation you want, and when is the follow-up scan if we need one?"', after: 'If all clear: log one line about what you saw, and let someone bring dinner. If indeterminate: use the three-rule waiting plan.' },
  { id: 'grad', label: 'Graduation to OB', offset: 44, window: '8–10 weeks (range 8–12)', what: 'Your RE closes out and your OB takes over. Records transfer, a last scan if scheduled, and the "what carries forward" list — your med taper timing, any aspirin/Lovenox notes, your dating.', tells: 'Everything, at that point — by 8–10 weeks a heartbeat is confirmed and this is a handoff, not a test.', cant: 'It doesn\'t end your clinic relationship permanently. Most REs stay reachable; ask directly.', prep: 'Bring the My Protocol table — it is exactly what your OB wants to inherit. Ask: "What week do I graduate, and what do you send the OB?"', after: 'Some people feel oddly abandoned by the IVF clinic around now. That is a real, common feeling, not a malfunction. Your support loop transfers with you.' },
  { id: 'nipt', label: 'NIPT / cfDNA', offset: 51, window: 'From 10 weeks', what: 'One blood draw. The lab reads placental DNA fragments in your blood — not fetal blood — and reports on a set of chromosomal conditions and, optionally, sex chromosomes.', tells: 'Screen-level detection: trisomy 21 >99%, 18 ~98%, 13 up to ~99% in some analyses; sex read from Y-DNA is right roughly 98–99% of the time when fetal fraction is adequate.', cant: 'It is a screen, not a diagnosis; only CVS (~10–13 weeks) or amniocentesis (~15+ weeks) are. About 1–5% of first draws come back no-call — most redraws succeed. A vanishing twin or a prior transplant can shift results.', prep: 'Ask: "Which NIPT panel, and what happens if the fetal fraction comes back low?"', after: 'No-call isn\'t bad news. It means "not enough sample from that draw" — a redraw usually clears it.' },
  { id: 'nt', label: 'NT scan', offset: 65, window: '11w0d–13w6d', what: 'A specialized ultrasound measuring a thin fluid layer behind the fetal neck. It needs a CRL of 45–84 mm to be valid, and is often paired with a first-trimester blood draw at the same visit.', tells: 'A combined screening figure for a handful of chromosomal conditions. It is a screen: it can flag, not diagnose.', cant: 'It doesn\'t check anatomy broadly and can\'t read sex meaningfully. Results can be borderline — which leads to more conversation, not a conclusion.', prep: 'Full bladder per the office\'s instructions; expect 45 minutes. Ask: "Do you want NT and a blood screen, NIPT instead, or both?"', after: 'If numbers come back interesting, the next move is a conversation with your OB — not a self-Google.' },
  { id: 'ob1', label: 'First OB visit', offset: 47, window: 'Around graduation', what: 'Your first full prenatal visit with the OB: history, blood pressure, labs, and the plan for the next four weeks.', tells: 'How the OB\'s practice works, who covers after hours, and what screening comes next.', cant: 'It is not a full anatomy scan; that comes at 18–22 weeks.', prep: 'Bring medication list, records, insurance card, and your question list.', after: 'Save the after-hours number in your phone before you leave the parking lot.' },
  { id: 'anatomy', label: 'Anatomy scan', offset: 121, window: '18–22 weeks (often 20)', what: 'A 30–45 minute scan checking organs, growth, placenta position, and — for a boy — visibly identifying penis and scrotum. Testes will be described as inside the abdomen; that is fully expected at this stage. A little fluid around the scrotum (hydrocele) is common and usually resolves.', tells: 'The structural check NIPT never does — and the confirmation of what NIPT said about sex.', cant: 'It can\'t predict how labor goes or what he will be like — and occasionally a detail needs a second look. Re-checking is routine.', prep: 'Ask about bladder prep and whether your support person can come. Wear a two-piece outfit; bring water.', after: 'Write down the one sentence you want to remember from this scan. Something about him being specific tends to stay.' }
];

/* ---------------- Utilities ---------------- */
const pad = n => String(n).padStart(2, '0');
const dateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => dateStr(new Date());
const parseDate = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return dateStr(d); };
const diffDays = (a, b) => Math.round((parseDate(a) - parseDate(b)) / 86400000);
const fmtDate = (s, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => s ? parseDate(s).toLocaleDateString('en-US', opts) : '—';
const fmtShort = s => s ? parseDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const timeLabel = t => { if (!t) return '—'; const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`; };
const minutesOf = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const sanitizePhone = p => String(p || '').replace(/[^\d+]/g, '');
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);

/* ---------------- State ---------------- */
let storageOK = true;
let state = null;
let currentView = 'today';
let previousLastOpened = null;
let selectedWeek = null;
let obStep = 1;
let obData = { transferDate: '', clinicName: '', clinicPhone: '', afterHoursPhone: '', meds: [] };
let breathTimer = null;

function freshState() {
  return {
    version: 2,
    profile: {
      transferDate: null, clinicName: '', clinicPhone: '', afterHoursPhone: '',
      hoursStart: '09:00', hoursEnd: '17:00', days: [1, 2, 3, 4, 5],
      graduationWeek: null, supportName: '', supportPhone: '', lossHistory: false,
      notes: '', onboarded: false, demo: false
    },
    meds: [],
    doses: {},
    logs: {},
    appointments: [],
    journal: [],
    worryWindow: { enabled: false, time: '17:00' },
    celebrations: { seen: {}, enabled: true },
    settings: { theme: 'light', celebrations: true, notifications: true },
    ui: {},
    meta: { createdAt: new Date().toISOString(), lastOpened: new Date().toISOString(), appVersion: APP_VERSION }
  };
}

function normalize(raw) {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const s = { ...base, ...raw };
  s.profile = { ...base.profile, ...(raw.profile || {}) };
  s.settings = { ...base.settings, ...(raw.settings || {}) };
  s.celebrations = { ...base.celebrations, ...(raw.celebrations || {}) };
  s.worryWindow = { ...base.worryWindow, ...(raw.worryWindow || {}) };
  s.ui = raw.ui || {};
  s.meta = { ...base.meta, ...(raw.meta || {}) };
  s.meds = Array.isArray(raw.meds) ? raw.meds : [];
  s.doses = raw.doses && typeof raw.doses === 'object' ? raw.doses : {};
  s.logs = raw.logs && typeof raw.logs === 'object' ? raw.logs : {};
  s.appointments = Array.isArray(raw.appointments) ? raw.appointments : [];
  s.journal = Array.isArray(raw.journal) ? raw.journal : [];
  return s;
}

function probeStorage() {
  try {
    localStorage.setItem('__ivf_probe', '1');
    localStorage.removeItem('__ivf_probe');
    return true;
  } catch (e) { return false; }
}

function loadState() {
  storageOK = probeStorage();
  if (!storageOK) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw));
  } catch (e) { return null; }
}

function save() {
  if (!state || state.profile.demo) return;
  if (!storageOK) { showStorageBanner(); return; }
  try {
    state.meta.lastOpened = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    storageOK = false;
    showStorageBanner();
  }
}

function showStorageBanner() {
  const el = $('#storageBanner');
  if (el) el.hidden = false;
}

/* ---------------- Dates & pregnancy math ---------------- */
function ga() {
  if (!state.profile.transferDate) return null;
  const dpt = diffDays(todayStr(), state.profile.transferDate);
  const total = 19 + dpt;
  if (total < 0) return { days: total, weeks: 0, d: 0, dpt, edd: addDays(state.profile.transferDate, 261), future: true };
  return {
    days: total,
    weeks: Math.floor(total / 7),
    d: total % 7,
    dpt,
    edd: addDays(state.profile.transferDate, 261),
    label: `${Math.floor(total / 7)}w${total % 7}d`,
    future: false
  };
}

function currentWeek() {
  const g = ga();
  if (!g || g.future) return null;
  return Math.floor(g.days / 7);
}

function nextAppointment() {
  if (!state.appointments.length) return null;
  const today = todayStr();
  const scheduled = state.appointments.filter(a => a.status !== 'done').sort((a, b) => a.date.localeCompare(b.date));
  return scheduled.find(a => a.date >= today) || scheduled[scheduled.length - 1] || null;
}

function apptDays(a) { return diffDays(a.date, todayStr()); }

function apptStatus(a) {
  if (a.status === 'done') return 'done';
  const d = apptDays(a);
  if (d === 0) return 'today';
  if (d < 0) return 'past';
  return 'upcoming';
}

function ensureAppointments(forceDates = false) {
  if (!state.profile.transferDate) return;
  const existing = new Map(state.appointments.map(a => [a.id, a]));
  APPT_SPECS.forEach(spec => {
    const found = existing.get(spec.id);
    if (!found) {
      state.appointments.push({
        id: spec.id, label: spec.label, date: addDays(state.profile.transferDate, spec.offset),
        window: spec.window, status: 'scheduled', notes: ''
      });
    } else if (forceDates && found.status !== 'done') {
      found.date = addDays(state.profile.transferDate, spec.offset);
    }
  });
}

/* ---------------- Clinic availability ---------------- */
function clinicOpenNow() {
  const d = new Date();
  const day = d.getDay();
  const mins = nowMinutes();
  const start = minutesOf(state.profile.hoursStart || '09:00');
  const end = minutesOf(state.profile.hoursEnd || '17:00');
  const days = Array.isArray(state.profile.days) ? state.profile.days : [1, 2, 3, 4, 5];
  return days.includes(day) && mins >= start && mins < end;
}

function primaryPhone() {
  if (!clinicOpenNow() && state.profile.afterHoursPhone) return { number: state.profile.afterHoursPhone, label: 'Call after hours' };
  if (state.profile.clinicPhone) return { number: state.profile.clinicPhone, label: 'Call clinic' };
  if (state.profile.afterHoursPhone) return { number: state.profile.afterHoursPhone, label: 'Call after hours' };
  return null;
}

function phoneButton(which, extraClass = '') {
  const main = state.profile.clinicPhone;
  const after = state.profile.afterHoursPhone;
  const num = which === 'after' ? after : main;
  const label = which === 'after' ? 'Call after hours' : 'Call clinic';
  const open = clinicOpenNow();
  if (!num) {
    return `<button class="btn ${extraClass}" data-action="open-settings">Add clinic number</button>`;
  }
  const primary = which === 'main' && open || which === 'after' && !open;
  return `<a class="btn ${primary ? 'btn-primary' : ''} ${extraClass}" href="tel:${esc(sanitizePhone(num))}">${I.phone} ${label}</a>`;
}

function callButtons(extra = '') {
  return `<div class="btn-row">${phoneButton('main', extra)}${state.profile.afterHoursPhone ? phoneButton('after', extra) : ''}<a class="btn ${extra}" href="tel:911">${I.phone} Call 911</a></div>`;
}

/* ---------------- Chrome ---------------- */
function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning.';
  if (h >= 12 && h < 17) return 'Good afternoon.';
  if (h >= 17 && h < 22) return 'Good evening.';
  return 'Late night, I see.';
}

function calmLine() {
  return CALM_LINES[dayOfYear(new Date()) % CALM_LINES.length];
}

function renderPrintBlock() {
  const el = $('#printSafety');
  if (!el) return;
  const g = ga();
  const main = state.profile.clinicPhone || 'not saved';
  const after = state.profile.afterHoursPhone || 'not saved';
  el.innerHTML = `
    <h1>After the Transfer — safety card</h1>
    <p>${g && !g.future ? `${esc(g.label)} · due ${esc(fmtDate(g.edd))} · transfer ${esc(fmtDate(state.profile.transferDate))}` : 'Transfer date not set'} · ${esc(state.profile.clinicName || 'Clinic not set')}</p>
    <h2>Go now — call 911 or go to the ER</h2>
    <ul>
      <li>Heavy bleeding — soaking a full pad in an hour or less, clots, or gray/white tissue.</li>
      <li>Severe or one-sided pain, or pain with a shoulder-tip ache.</li>
      <li>Fainting or near-fainting.</li>
      <li>Fever of 100.4°F / 38°C or higher with any other symptom.</li>
      <li>Can't keep fluids down for 24 hours, or can't pee normally.</li>
      <li>Chest pain, trouble breathing at rest, or coughing blood.</li>
      <li>Thoughts of harming yourself or the pregnancy → 988, your OB, or the ER.</li>
    </ul>
    <h2>Call your clinic today</h2>
    <ul>
      <li>Any spotting or bleeding, light or brown, once or ongoing.</li>
      <li>New or different cramping; moderate pain.</li>
      <li>Foul-smelling discharge, especially after a procedure.</li>
      <li>Fever that stays up 24 hours, any level.</li>
      <li>Food won't stay down, but fluids will.</li>
      <li>A calf that is suddenly warm, swollen, or painful on one side.</li>
      <li>Anxiety you can't work, eat, or sleep through; intrusive thoughts.</li>
    </ul>
    <p><strong>Clinic:</strong> ${esc(main)} · <strong>After hours:</strong> ${esc(after)} · <strong>Emergency:</strong> 911 · <strong>Crisis:</strong> 988</p>
    <p><strong>[VERIFY LOCALLY]</strong> Antibiotics, antifungals, opioids, and other prescriptions can interact with IVF support medications. Mention the regimen to every prescriber, and keep your clinic's written interaction list with this handout.</p>
    <p>This tracker is education, not medical advice. Your clinic's instructions always outrank anything here.</p>`;
}

function renderChrome() {
  const titles = { today: 'Today', protocol: 'Protocol', checkin: 'Check-in', baby: 'Little One', learn: 'Learn' };
  const t = $('#topbarTitle'); if (t) t.textContent = titles[currentView] || 'Today';
  const d = $('#topbarDate'); if (d) d.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  $$('[data-view]').forEach(btn => {
    const on = btn.dataset.view === currentView;
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    btn.tabIndex = on ? 0 : -1;
  });
  const demo = $('#demoBanner'); if (demo) demo.hidden = !state.profile.demo;
  const sb = $('#storageBanner'); if (sb) sb.hidden = storageOK;
  renderPrintBlock();
}

function switchView(view, focus = true) {
  currentView = view;
  $$('.view').forEach(v => { v.hidden = v.id !== `view-${view}`; });
  renderChrome();
  const target = $(`#view-${view}`);
  if (view === 'today') renderToday();
  else if (view === 'protocol') renderProtocol();
  else if (view === 'checkin') renderCheckin();
  else if (view === 'baby') renderBaby();
  else if (view === 'learn') renderLearn();
  if (focus && target) { target.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------- Today ---------------- */
function renderToday() {
  const el = $('#view-today');
  const g = ga();
  const appt = nextAppointment();
  const greetingText = greeting();
  const late = new Date().getHours() >= 22 || new Date().getHours() < 5;

  let context;
  if (!g) {
    context = `<div class="context">
      <div>
        <div class="eyebrow">Your dashboard</div>
        <h1>Let's set the one date.</h1>
        <p class="muted" style="margin-top:6px">Your transfer date unlocks your week, your EDD, and every appointment. Everything else can wait.</p>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-primary" data-action="open-settings">Set transfer date</button>
          <button class="btn" data-action="start-demo">Explore demo</button>
        </div>
      </div>
    </div>`;
  } else if (g.future) {
    context = `<div class="context">
      <div>
        <div class="eyebrow">Your dashboard</div>
        <h1>Your transfer is ahead.</h1>
        <p class="muted" style="margin-top:6px">The date you entered is in the future. Check it in Settings if that was a typo.</p>
        <div class="btn-row" style="margin-top:14px"><button class="btn" data-action="open-settings">Edit transfer date</button></div>
      </div>
    </div>`;
  } else {
    context = `<div class="context">
      <div>
        <div class="eyebrow">${greetingText}</div>
        <h1>${g.label} <span class="muted" style="font-weight:500;font-size:1rem">· ${g.days} days</span></h1>
        <div class="meta">
          <span>Due <strong>${fmtDate(g.edd, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
          ${appt ? `<span>${esc(appt.label)} <strong>${apptDays(appt) === 0 ? 'today' : apptDays(appt) > 0 ? 'in ' + apptDays(appt) + ' days' : 'recent'}</strong></span>` : '<span>Next appointment TBD</span>'}
        </div>
        ${late ? '<p class="small muted" style="margin-top:8px">Nothing here needs urgent attention. If something physical is happening right now, the Safety tab knows what to do.</p>' : ''}
      </div>
      <div class="ga-ring" style="--p:${clamp((g.days / 154) * 100, 2, 100)}" aria-label="Week ${g.weeks} of 22">
        <span>${g.weeks}<small>weeks</small></span>
      </div>
    </div>`;
  }

  el.innerHTML = `
    ${context}
    <div class="stack" style="margin-top:18px">
      ${renderFocusCard()}
      ${renderMedsCard()}
      ${renderWaterCard()}
      ${renderCheckinTeaser()}
      <div class="card card-soft">
        <div class="card-head"><h3>Today's calm line</h3><span class="pill pill-primary">For you</span></div>
        <p style="font-size:.96rem">${esc(calmLine())}</p>
      </div>
      ${appt ? renderNextApptCard(appt) : ''}
      <p class="tiny muted center" style="margin-top:6px">Education, not medical advice. Your clinic's instructions always outrank anything here.</p>
    </div>`;
}

function computeFocus() {
  const today = todayStr();
  const g = ga();
  const appt = nextAppointment();
  const log = state.logs[today];
  const last = (previousLastOpened || state.meta.lastOpened || '').slice(0, 10);
  const gap = last ? diffDays(today, last) : 0;

  if (gap >= 2 && state.ui.reentryDismissed !== today) {
    const lastDose = lastDoseDate();
    const low = lowestSupply();
    let extra = '';
    if (lastDose && diffDays(today, lastDose) > 1 && state.meds.some(m => m.active !== false && m.isHormonal)) {
      extra = `<p class="small" style="margin-top:8px">More than a day with no progesterone or estrogen is worth a two-minute call before restarting — the clinic sets the resume plan. That's the whole ask.</p>`;
    }
    return {
      kind: 'reentry', title: 'Welcome back.', why: 'Nobody\'s behind here.',
      body: `Two honest facts before anything else: your last recorded hormonal dose was <strong>${lastDose ? fmtShort(lastDose) : 'not recorded'}</strong>. ${low ? `Your <strong>${esc(low.name)}</strong> looks low (${low.days} days on hand).` : 'Your medication supply is not tracked yet.'}${extra}<p class="small" style="margin-top:8px">Days you didn't open the app aren't logged as missed. Mention the gap when you call — that's all.</p>`,
      primary: { label: 'Check that when you\'re ready', action: 'goto-protocol' },
      secondary: { label: 'Dismiss for today', action: 'dismiss-reentry' }
    };
  }

  if (log && log.tier === 2 && !log.safetyOpened) {
    return {
      kind: 'tier2', title: 'Open Safety now.', why: 'Something you logged today fits the go-now list.',
      body: 'The Safety panel shows what to do, in order, with the numbers first.',
      primary: { label: 'Open Safety', action: 'open-safety' }
    };
  }
  if (log && log.tier === 2 && log.safetyOpened && !log.acknowledged) {
    return {
      kind: 'tier2', title: 'Follow the Safety plan.', why: 'You logged something that needs urgent care.',
      body: 'If you have not called yet, call now. If symptoms are worsening, go to the ER.',
      primary: { label: 'Open Safety again', action: 'open-safety' },
      secondary: { label: 'Mark handled', action: 'ack-tier2' }
    };
  }
  if (log && log.tier === 1 && !log.acknowledged) {
    return {
      kind: 'tier1', title: 'Call the clinic today.', why: `About: ${escapeReason(log)}.`,
      body: 'You don\'t need a script — "I\'m ' + (g ? g.label : 'post-transfer') + ' and wanted to check a symptom" is complete.',
      primary: { label: 'Call clinic', action: 'call-clinic' },
      secondary: { label: 'Log & mention at next visit', action: 'ack-tier1' }
    };
  }

  if (state.ui.focusDoneDate === today) {
    return {
      kind: 'fallback', title: 'The rest of today is optional.', why: 'Done. That\'s the day\'s main thing handled.',
      body: `The next scheduled item is ${nextDoseLine()}. Nothing else needs you. Close the app if you want — that counts.`,
      primary: { label: 'Grounding', action: 'goto-grounding' }
    };
  }

  const low = lowestSupply();
  const snoozed = state.ui.refillSnooze && low && state.ui.refillSnooze[low.id] === today;
  if (low && low.days < 7 && !low.ordered && !snoozed) {
    return {
      kind: 'refill', title: `Order your ${low.name} refill.`, why: `You have about ${low.days} days on hand.`,
      body: 'The 7-day buffer exists because pharmacies — especially compounding ones — sometimes need lead time on PIO.',
      primary: { label: 'Mark ordered', action: 'mark-ordered', arg: low.id },
      secondary: { label: 'Not yet — remind me tomorrow', action: 'snooze-refill', arg: low.id }
    };
  }

  if (g && !g.future && g.weeks >= 8 && !state.profile.graduationWeek) {
    return {
      kind: 'graduation', title: 'Two questions for your RE.', why: 'Graduation week isn\'t set.',
      body: 'When is graduation to your OB, and what gets sent over in your records? If neither is on paper yet, this visit\'s the moment.',
      primary: { label: 'Open Protocol', action: 'goto-protocol' },
      secondary: { label: 'Call clinic', action: 'call-clinic' }
    };
  }

  const due = medsDue().sort((a, b) => b.overdue - a.overdue)[0];
  if (due) {
    return {
      kind: 'med', title: `It's time for your ${due.med.name}.`, why: `Scheduled ${timeLabel(due.med.time)}; window ${due.window}.`,
      body: isPIOMed(due.med) ? 'Site rotation is in Protocol if you want the next spot.' : 'Take it as prescribed. You can log it right here.',
      primary: { label: 'Mark done', action: 'mark-med', arg: due.med.id },
      secondary: { label: 'Missed it?', action: 'open-missed', arg: due.med.id }
    };
  }

  if (appt && apptDays(appt) >= 0 && apptDays(appt) <= 7) {
    return {
      kind: 'appt', title: `Your ${appt.label} is ${apptDays(appt) === 0 ? 'today' : apptDays(appt) + ' days away'}.`, why: fmtDate(appt.date, { weekday: 'short', month: 'short', day: 'numeric' }),
      body: 'Reading the "what it can tell you / can\'t yet" for this one takes two minutes and reliably lowers the imagination tax.',
      primary: { label: 'Prep for this visit', action: 'goto-appt', arg: appt.id }
    };
  }

  if (!log) {
    return {
      kind: 'checkin', title: 'Log today\'s check-in.', why: '30 seconds, no verdicts.',
      body: 'It\'s yours, not a grade. A quiet day is worth recording too.',
      primary: { label: 'Start check-in', action: 'goto-checkin' }
    };
  }

  const water = (log.water || 0);
  if (new Date().getHours() >= 15 && water < 6) {
    return {
      kind: 'water', title: 'Drink some water.', why: `${water} of 8 so far.`,
      body: 'Six glasses by 9 is plenty. Small sips count double when you\'re queasy.',
      primary: { label: 'Counted a glass', action: 'add-water' }
    };
  }

  return {
    kind: 'fallback', title: 'Nothing needs you right now.', why: 'The calendar is clear, the meds aren\'t due yet.',
    body: 'Want a two-minute grounding anyway? Or just close the app. Both are good.',
    primary: { label: 'Grounding', action: 'goto-grounding' },
    secondary: { label: 'Call clinic', action: 'call-clinic' }
  };
}

function escapeReason(log) {
  if (!log) return 'a symptom you logged today';
  if (log.spotting && log.spotting.reported) return 'you logged spotting today';
  if (log.cramps && log.cramps.reported) return 'you logged cramping today';
  return 'a symptom you logged today';
}

function renderFocusCard() {
  const f = computeFocus();
  const cls = f.kind === 'tier2' ? 'tier2' : f.kind === 'tier1' ? 'tier1' : '';
  let primary = '';
  if (f.primary) {
    if (f.primary.action === 'call-clinic') {
      primary = phoneButton('main', 'btn-primary');
    } else {
      primary = `<button class="btn btn-primary" data-action="${f.primary.action}" ${f.primary.arg ? `data-arg="${esc(f.primary.arg)}"` : ''}>${esc(f.primary.label)}</button>`;
    }
  }
  let secondary = '';
  if (f.secondary) {
    secondary = `<button class="btn" data-action="${f.secondary.action}" ${f.secondary.arg ? `data-arg="${esc(f.secondary.arg)}"` : ''}>${esc(f.secondary.label)}</button>`;
  }
  return `<section class="card focus-card ${cls}" aria-labelledby="focusTitle">
    <div class="card-head">
      <div><div class="eyebrow">Today's one thing</div><h2 id="focusTitle">${esc(f.title)}</h2></div>
      <span class="pill ${f.kind === 'tier2' ? 'pill-urgent' : f.kind === 'tier1' ? 'pill-warn' : 'pill-primary'}">${f.kind === 'tier2' ? 'Urgent' : f.kind === 'tier1' ? 'Call today' : 'One step'}</span>
    </div>
    <div class="card-body">
      <p class="why">${esc(f.why)}</p>
      <p class="small">${f.body}</p>
      <div class="btn-row">${primary}${secondary}</div>
    </div>
  </section>`;
}

function isPIOMed(med) {
  if (!med) return false;
  const n = (med.name || '').toLowerCase();
  const r = (med.route || '').toLowerCase();
  const im = r === 'im' || r.includes('musc');
  return med.isPIO === true || n.includes('oil') || n.includes('pio') || (im && n.includes('progesterone'));
}

function medsDue() {
  const out = [];
  state.meds.filter(m => m.active !== false).forEach(med => {
    if (isTaken(med.id)) return;
    const sched = minutesOf(med.time || '09:00');
    const now = nowMinutes();
    const open = sched - 60;
    const close = sched + 120;
    if (now >= open && now <= close) {
      out.push({ med, overdue: Math.max(0, now - sched), window: `${timeLabel(med.time)} ±2h` });
    }
  });
  return out;
}

function isTaken(medId, date = todayStr()) {
  return !!(state.doses[date] && state.doses[date][medId] && state.doses[date][medId].taken);
}

function medRow(med) {
  const taken = isTaken(med.id);
  const sched = minutesOf(med.time || '09:00');
  const now = nowMinutes();
  const addedToday = med.createdAt === todayStr();
  const due = !taken && now >= sched - 60 && now <= sched + 120;
  const missed = !taken && now > sched + 120 && !addedToday;
  const stateText = taken ? '<span class="dot"></span>Taken' : due ? '<span class="dot"></span>Due now' : missed ? '<span class="dot"></span>Missed · tap' : addedToday ? `Added today · ${timeLabel(med.time)}` : `Scheduled ${timeLabel(med.time)}`;
  const stateCls = taken ? 'done' : due ? 'due' : missed ? 'missed' : '';
  return `<div class="med-row">
    <button class="med-check" data-action="${taken ? 'unmark-med' : 'mark-med'}" data-arg="${esc(med.id)}" aria-pressed="${taken}" aria-label="${taken ? 'Mark ' + esc(med.name) + ' not taken' : 'Mark ' + esc(med.name) + ' taken'}">
      ${I.check}
    </button>
    <div class="med-main">
      <div class="med-name">${esc(med.name)}</div>
      <div class="med-meta">${esc(med.dose || '')}${med.dose ? ' · ' : ''}${esc(med.route || '')} · ${timeLabel(med.time)}</div>
    </div>
    <button class="med-state ${stateCls}" data-action="${missed ? 'open-missed' : taken ? 'unmark-med' : 'mark-med'}" data-arg="${esc(med.id)}" style="border:0;background:transparent;font:inherit;padding:6px">${stateText}</button>
  </div>`;
}

function renderMedsCard() {
  const meds = state.meds.filter(m => m.active !== false);
  if (!meds.length) {
    return `<section class="card">
      <div class="card-head"><h2>Medications</h2><span class="pill">Today</span></div>
      <div class="empty"><strong>No meds yet.</strong>Add them whenever. Nothing broke.<div style="margin-top:10px"><button class="btn btn-sm" data-action="open-settings">Add in Settings</button></div></div>
    </section>`;
  }
  return `<section class="card">
    <div class="card-head"><h2>Medications</h2><button class="link-btn" data-action="open-settings">Manage</button></div>
    <div>${meds.map(medRow).join('')}</div>
    <p class="tiny muted" style="margin-top:10px">Next: ${esc(nextDoseLine())}</p>
    <div class="btn-row" style="margin-top:10px"><button class="btn btn-sm" data-action="open-missed">Missed a dose?</button></div>
  </section>`;
}

function nextDoseLine() {
  const meds = state.meds.filter(m => m.active !== false);
  if (!meds.length) return 'no medications set';
  const now = nowMinutes();
  const today = meds.filter(m => !isTaken(m.id) && minutesOf(m.time || '09:00') > now).sort((a, b) => minutesOf(a.time || '09:00') - minutesOf(b.time || '09:00'));
  if (today.length) return `${today[0].name} today at ${timeLabel(today[0].time)}`;
  const tomorrow = [...meds].sort((a, b) => minutesOf(a.time || '09:00') - minutesOf(b.time || '09:00'))[0];
  return `${tomorrow.name} tomorrow at ${timeLabel(tomorrow.time)}`;
}

function renderWaterCard() {
  const log = state.logs[todayStr()] || {};
  const water = clamp(log.water || 0, 0, 8);
  const ate = !!log.ate;
  return `<section class="card">
    <div class="card-head"><h2>Water &amp; gentle eating</h2><span class="pill pill-blue">${water}/8</span></div>
    <p class="small muted">Small sips. Small meals. Salt and plain crackers are legitimate tools, not failures.</p>
    <div class="water-row" style="margin-top:12px" role="group" aria-label="Water glasses">
      ${Array.from({ length: 8 }, (_, i) => `<button class="water-dot" data-action="set-water" data-arg="${i + 1}" aria-pressed="${i < water}" aria-label="${i + 1} glass${i ? 'es' : ''}">${I.drop}</button>`).join('')}
    </div>
    <label class="checked-line" style="margin-top:10px">
      <input type="checkbox" data-action="toggle-ate" ${ate ? 'checked' : ''}>
      <span class="small">I ate something today. Anything counts.</span>
    </label>
  </section>`;
}

function renderCheckinTeaser() {
  const log = state.logs[todayStr()];
  if (!log) {
    return `<section class="card card-primary">
      <div class="card-head"><h2>30-second check-in</h2><span class="pill pill-primary">For you</span></div>
      <p class="small muted">Nausea, fatigue, anxiety, spotting, cramps. No verdicts. It's yours, not a grade.</p>
      <div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-action="goto-checkin">Start check-in</button></div>
    </section>`;
  }
  const bits = [];
  if (log.spotting && log.spotting.reported) bits.push('spotting logged');
  if (log.cramps && log.cramps.reported) bits.push('cramps logged');
  if (log.tier === 2) bits.push('urgent flag');
  if (!bits.length) bits.push('quiet day');
  return `<section class="card">
    <div class="card-head"><h2>Today's check-in</h2><span class="pill ${log.tier === 2 ? 'pill-urgent' : log.tier === 1 ? 'pill-warn' : 'pill-primary'}">${log.tier === 2 ? 'Urgent' : log.tier === 1 ? 'Call today' : 'Logged'}</span></div>
    <p class="small">Nausea ${log.nausea ?? 0}/10 · fatigue ${log.fatigue ?? 0}/10 · anxiety ${log.anxiety ?? 0}/10 · ${esc(bits.join(' · '))}</p>
    ${log.tier === 1 && !log.acknowledged ? `<div class="callout callout-warn" style="margin-top:12px">${I.alert}<div><p><strong>You logged something that gets a same-day call.</strong> The clinic card is one tap away.</p><div class="btn-row" style="margin-top:10px">${phoneButton('main', 'btn-sm')}</div></div></div>` : ''}
    <div class="btn-row" style="margin-top:12px"><button class="btn btn-sm" data-action="goto-checkin">Update check-in</button></div>
  </section>`;
}

function renderNextApptCard(appt) {
  const days = apptDays(appt);
  return `<section class="card card-soft">
    <div class="card-head"><div><div class="eyebrow">Next appointment</div><h3>${esc(appt.label)}</h3></div><span class="pill pill-blue">${days === 0 ? 'Today' : days > 0 ? `In ${days} days` : 'Recent'}</span></div>
    <p class="small muted">${fmtDate(appt.date, { weekday: 'long', month: 'long', day: 'numeric' })} · ${esc(appt.window || '')}</p>
    <div class="btn-row" style="margin-top:12px"><button class="btn btn-sm" data-action="goto-appt" data-arg="${esc(appt.id)}">What to expect</button></div>
  </section>`;
}

/* ---------------- Protocol ---------------- */
function renderProtocol() {
  const el = $('#view-protocol');
  const g = ga();
  const appt = nextAppointment();
  const meds = state.meds.filter(m => m.active !== false);
  const low = lowestSupply();

  el.innerHTML = `
    <div class="row-between" style="margin-bottom:16px">
      <div><div class="eyebrow">The medical part, made calm</div><h1>Protocol</h1></div>
      <button class="btn btn-sm" data-action="open-settings">${I.edit} Edit</button>
    </div>
    ${g && !g.future ? `<div class="context context-compact" style="margin-bottom:18px">
      <div><div class="eyebrow">You are here</div><h2>${g.label}</h2>
      <p class="small muted" style="margin-top:4px">Due ${fmtDate(g.edd, { month: 'short', day: 'numeric', year: 'numeric' })} · transfer ${fmtDate(state.profile.transferDate)} · day-5 blastocyst</p></div>
      <span class="pill pill-primary">${g.dpt} days post-transfer</span>
    </div>` : ''}

    <div class="stack">
      <section class="card">
        <div class="card-head"><h2>What's next</h2><span class="pill">${appt ? (apptDays(appt) === 0 ? 'Today' : apptDays(appt) > 0 ? apptDays(appt) + ' days' : 'Recent') : 'TBD'}</span></div>
        ${appt ? `<p><strong>${esc(appt.label)}</strong> — ${fmtDate(appt.date, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <p class="small muted">${esc(appt.window || '')}</p>
        <div class="btn-row" style="margin-top:12px"><button class="btn btn-primary btn-sm" data-action="goto-appt" data-arg="${esc(appt.id)}">Prep for this visit</button></div>`
        : `<p class="small muted">Nothing on the calendar. In early IVF pregnancy, that usually means betas are done and your first scan is worth putting a date to.</p><div class="btn-row" style="margin-top:12px">${phoneButton('main', 'btn-sm')}</div>`}
      </section>

      <section class="card">
        <div class="card-head"><h2>Medications</h2><button class="link-btn" data-action="open-settings">Edit schedule</button></div>
        ${meds.length ? `<div class="stack-sm">${meds.map(medProtocolCard).join('')}</div>` : `<div class="empty"><strong>No medications set.</strong>Add them in Settings whenever you're ready.</div>`}
        <div class="btn-row" style="margin-top:14px"><button class="btn btn-sm" data-action="open-missed">Missed a dose? Walk me through it</button></div>
      </section>

      <section class="card ${low && low.days < 7 ? 'card-warn' : ''}">
        <div class="card-head"><h2>Refill buffer</h2><span class="pill ${low && low.days < 7 ? 'pill-warn' : 'pill-primary'}">${low ? low.days + ' days' : 'Track it'}</span></div>
        ${low ? `<p class="small">${refillCopy(low)}</p><div class="btn-row" style="margin-top:12px"><button class="btn btn-sm" data-action="mark-ordered" data-arg="${esc(low.id)}">Mark ordered</button><button class="btn btn-sm" data-action="open-settings">Update supply</button></div>`
        : `<p class="small muted">Add days-on-hand in Settings so a refill never becomes a panic.</p>`}
        <p class="tiny muted" style="margin-top:10px">The 7-day buffer exists because PIO is often a compounding special order.</p>
      </section>

      <section class="card">
        <div class="card-head"><h2>Taper / stop window</h2></div>
        ${meds.filter(m => m.isHormonal).map(m => `<div class="setting-block" style="padding:10px 0"><strong>${esc(m.name)}</strong><p class="small">${m.stopWeek ? `Stop window: week ${esc(m.stopWeek)}, per your RE. Within it, your clinic leads; you follow. If cramping or light spotting shows up after a stop, that's a known withdrawal effect — and still report any bleeding.` : `Stop window: not set yet. Most clinics land somewhere in weeks 8–12 — that's the most common answer, <strong>not necessarily yours</strong>. Ask: "What exact week do I stop, and is it a taper or a hard stop?"`}</p></div>`).join('') || '<p class="small muted">No hormonal medications are tracked. If you are on progesterone or estrogen, add them in Settings.</p>'}
      </section>

      <section class="card">
        <div class="card-head"><h2>Appointment timeline</h2><span class="pill">${state.appointments.filter(a => a.status === 'done').length}/${state.appointments.length} done</span></div>
        <div class="timeline" style="margin-top:8px">
          ${state.appointments.slice().sort((a, b) => a.date.localeCompare(b.date)).map(a => apptTimelineItem(a)).join('')}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>My protocol notes</h2></div>
        <p class="small muted">Doses, stop weeks, pelvic rest, exercise limits — anything your clinic told you that this app doesn't know.</p>
        <textarea class="textarea" id="protocolNotes" placeholder="Example: PIO 50 mg IM at 8 pm; stop at 10w0d with taper to every other day for 5 days. Pelvic rest until first scan.">${esc(state.profile.notes || '')}</textarea>
        <div class="btn-row" style="margin-top:10px"><button class="btn btn-sm" data-action="save-notes">Save notes</button><button class="btn btn-sm" data-action="print">${I.print} Print</button></div>
      </section>

      <section class="card card-soft">
        <div class="card-head"><h2>Questions to bring</h2><button class="link-btn" data-action="goto-learn">Learn / FAQ</button></div>
        <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:6px">
          <li>What week do I graduate, and what gets sent to the OB?</li>
          <li>What exact week do I stop progesterone, and is it a taper or a hard stop?</li>
          <li>Am I on pelvic rest? For how long, and what exactly does it include?</li>
          <li>When is my next scan, and what would make you ask me back?</li>
          <li>What is the after-hours number, and when should I use it?</li>
        </ul>
      </section>

      <p class="tiny muted center">The app follows your protocol. It does not prescribe one. Every dose, taper, and stop week comes from your RE.</p>
    </div>`;
}

function medProtocolCard(med) {
  const taken = isTaken(med.id);
  const supply = supplyInfo(med);
  return `<div class="callout" style="align-items:flex-start">
    <div style="color:var(--primary-dark)">${I.pill}</div>
    <div style="flex:1;min-width:0">
      <div class="row-between"><strong>${esc(med.name)}</strong><span class="pill ${taken ? 'pill-primary' : ''}">${taken ? 'Taken today' : timeLabel(med.time)}</span></div>
      <p class="small muted">${esc(med.dose || '')}${med.dose ? ' · ' : ''}${esc(med.route || '')}${med.isHormonal ? ' · hormonal support' : ''}</p>
      <p class="tiny muted" style="margin-top:4px">${supply ? `${supply.days} days on hand${supply.ordered ? ' · ordered, arriving soon' : ''}` : 'Supply not tracked'}</p>
      <div class="btn-row" style="margin-top:8px">
        <button class="btn btn-sm" data-action="${taken ? 'unmark-med' : 'mark-med'}" data-arg="${esc(med.id)}">${taken ? 'Undo today' : 'Mark taken'}</button>
        ${isPIOMed(med) ? `<button class="btn btn-sm" data-action="toggle-site" data-arg="${esc(med.id)}">Next site: ${esc(nextSite(med))}</button>` : ''}
      </div>
      ${isPIOMed(med) ? `<p class="tiny muted" style="margin-top:8px">Upper-outer glute, alternate sides. Warm compress 5–10 min before, gentle massage after. Lumps are common; spreading redness, warmth, or fever → call. Never stop PIO because a site hurts.</p>` : ''}
    </div>
  </div>`;
}

function nextSite(med) {
  const rotations = state.ui.siteRotation || {};
  const last = rotations[med.id] || 'left';
  return last === 'left' ? 'right' : 'left';
}

function apptTimelineItem(a) {
  const st = apptStatus(a);
  const cls = st === 'done' ? 'done' : st === 'today' ? 'now' : '';
  const meta = st === 'done' ? 'Done' : st === 'past' ? 'Was this today? Update it.' : fmtDate(a.date, { weekday: 'short', month: 'short', day: 'numeric' });
  return `<div class="tl-item ${cls}">
    <div class="tl-dot">${st === 'done' ? I.check : st === 'today' ? '•' : ''}</div>
    <div class="tl-body">
      <div class="tl-title">${esc(a.label)}</div>
      <div class="tl-meta">${esc(a.window || '')} · ${meta}</div>
      <div class="row" style="margin-top:6px;gap:6px">
        <button class="link-btn" data-action="goto-appt" data-arg="${esc(a.id)}">What to expect</button>
        ${st !== 'done' ? `<button class="link-btn" data-action="mark-appt-done" data-arg="${esc(a.id)}">Mark done</button>` : ''}
      </div>
    </div>
  </div>`;
}

function refillCopy(low) {
  if (low.ordered) return `You marked <strong>${esc(low.name)}</strong> as ordered. The countdown pauses until it arrives. If it hasn't come in 3 days, call the pharmacy.`;
  if (low.days <= 0) return `<strong>${esc(low.name)}:</strong> none on hand. Call the pharmacy and the clinic both — never skip-pause a hormone med to stretch a supply.`;
  if (low.days < 7) return `<strong>${esc(low.name)}:</strong> ${low.days} days on hand. Order today — PIO is an oil special-order at many pharmacies; lead time is real.`;
  if (low.days < 14) return `<strong>${esc(low.name)}:</strong> ${low.days} days on hand — inside the buffer window. Order when convenient this week.`;
  return `<strong>${esc(low.name)}:</strong> ${low.days} days on hand. Buffer's fine. Next reminder lands 7–10 days out.`;
}

/* ---------------- Check-in ---------------- */
function renderCheckin() {
  const el = $('#view-checkin');
  const log = state.logs[todayStr()] || {};
  const spot = log.spotting || {};
  const cramp = log.cramps || {};
  const result = log.tier !== undefined ? checkinResultHtml(log) : '';

  el.innerHTML = `
    <div class="row-between" style="margin-bottom:16px">
      <div><div class="eyebrow">Private. No verdicts. Yours.</div><h1>30-second check-in</h1></div>
      <span class="pill pill-primary">${log.savedAt ? 'Saved today' : 'Today'}</span>
    </div>

    <div class="stack">
      ${result}
      <section class="card">
        <form id="checkinForm" class="form-grid" novalidate>
          ${sliderField('Nausea', 'ciNausea', log.nausea ?? 0, '0 — none', '10 — constant')}
          ${sliderField('Fatigue', 'ciFatigue', log.fatigue ?? 0, '0 — none', '10 — can\'t get up')}
          ${sliderField('Anxiety right now', 'ciAnxiety', log.anxiety ?? 0, '0 — flat and fine', '10 — can\'t function')}

          <div class="switch-row">
            <div><div class="label">Slept okay?</div><div class="sub">Sleep is a symptom too.</div></div>
            <label class="switch"><input type="checkbox" id="ciSleep" ${log.sleepOk !== false ? 'checked' : ''}><span class="track"></span><span class="sr-only">Slept okay</span></label>
          </div>

          <div class="switch-row">
            <div><div class="label">Spotting</div><div class="sub">Any amount gets a call.</div></div>
            <label class="switch"><input type="checkbox" id="ciSpotting" ${spot.reported ? 'checked' : ''}><span class="track"></span><span class="sr-only">Spotting</span></label>
          </div>
          <div id="spotPanel" class="card card-soft" ${spot.reported ? '' : 'hidden'}>
            <div class="field">
              <div class="field-label">How much do you see?</div>
              <div class="radio-group" role="radiogroup" aria-label="Amount of spotting">
                ${radio('spotAmount', 'spots', 'Spots when I wipe', spot.amount === 'spots')}
                ${radio('spotAmount', 'light', 'Light flow, no pad needed', spot.amount === 'light')}
                ${radio('spotAmount', 'heavy', 'Soaking a pad in an hour or less', spot.amount === 'heavy')}
                ${radio('spotAmount', 'clots', 'Clots, or gray/white tissue', spot.amount === 'clots')}
              </div>
            </div>
            <div class="switch-row" style="margin-top:10px">
              <div><div class="label">Dizzy, lightheaded, or fainted?</div></div>
              <label class="switch"><input type="checkbox" id="ciSpotDizzy" ${spot.dizzy ? 'checked' : ''}><span class="track"></span><span class="sr-only">Dizzy or fainted with spotting</span></label>
            </div>
          </div>

          <div class="switch-row">
            <div><div class="label">Cramping</div><div class="sub">Mild and both-sided is common.</div></div>
            <label class="switch"><input type="checkbox" id="ciCramps" ${cramp.reported ? 'checked' : ''}><span class="track"></span><span class="sr-only">Cramping</span></label>
          </div>
          <div id="crampPanel" class="card card-soft" ${cramp.reported ? '' : 'hidden'}>
            <div class="field">
              <div class="field-label">How bad is it?</div>
              <div class="radio-group" role="radiogroup" aria-label="Pain level">
                ${radio('painLevel', 'mild', 'Mild — noticeable, easy to talk through', cramp.pain === 'mild')}
                ${radio('painLevel', 'moderate', 'Moderate — distracting', cramp.pain === 'moderate')}
                ${radio('painLevel', 'severe', 'Severe — hard to stand or think', cramp.pain === 'severe')}
              </div>
            </div>
            <div class="switch-row" style="margin-top:8px">
              <div><div class="label">Mostly on one side?</div></div>
              <label class="switch"><input type="checkbox" id="ciOneSided" ${cramp.oneSided ? 'checked' : ''}><span class="track"></span><span class="sr-only">Pain mostly on one side</span></label>
            </div>
            <div class="switch-row">
              <div><div class="label">Pain at your shoulder tip?</div><div class="sub">Where the shoulder meets the back.</div></div>
              <label class="switch"><input type="checkbox" id="ciShoulder" ${cramp.shoulder ? 'checked' : ''}><span class="track"></span><span class="sr-only">Shoulder-tip pain</span></label>
            </div>
            <div class="switch-row">
              <div><div class="label">Dizzy, lightheaded, or fainted?</div></div>
              <label class="switch"><input type="checkbox" id="ciCrampDizzy" ${cramp.dizzy ? 'checked' : ''}><span class="track"></span><span class="sr-only">Dizzy or fainted with cramping</span></label>
            </div>
          </div>

          <details class="faq" style="border-radius:12px">
            <summary>Anything else? (fever, fluids, chest, calf, intrusive thoughts)</summary>
            <div class="faq-body" style="padding-top:12px">
              <div class="switch-row"><div><div class="label">Fever ≥100.4°F / 38°C</div><div class="sub">Alone, that's a call today. With spotting, cramping, or calf pain, it's urgent.</div></div><label class="switch"><input type="checkbox" id="ciFever" ${log.fever ? 'checked' : ''}><span class="track"></span><span class="sr-only">Fever</span></label></div>
              <div class="switch-row"><div><div class="label">Fainted or nearly fainted</div><div class="sub">Even with no other symptom, this is a go-now sign.</div></div><label class="switch"><input type="checkbox" id="ciFainted" ${log.fainted ? 'checked' : ''}><span class="track"></span><span class="sr-only">Fainted or nearly fainted</span></label></div>
              <div class="switch-row"><div><div class="label">Can't keep fluids down 24 h</div></div><label class="switch"><input type="checkbox" id="ciFluids" ${log.fluidsDown ? 'checked' : ''}><span class="track"></span><span class="sr-only">Can't keep fluids down</span></label></div>
              <div class="switch-row"><div><div class="label">Chest pain, trouble breathing, or coughing blood</div></div><label class="switch"><input type="checkbox" id="ciChest" ${log.chest ? 'checked' : ''}><span class="track"></span><span class="sr-only">Chest symptoms</span></label></div>
              <div class="switch-row"><div><div class="label">One calf suddenly warm, swollen, or painful</div></div><label class="switch"><input type="checkbox" id="ciCalf" ${log.calf ? 'checked' : ''}><span class="track"></span><span class="sr-only">Calf symptoms</span></label></div>
              <div class="switch-row"><div><div class="label">Thoughts of harming yourself or the pregnancy</div><div class="sub">This is a medical emergency, not a character flaw.</div></div><label class="switch"><input type="checkbox" id="ciSelfHarm" ${log.selfHarm ? 'checked' : ''}><span class="track"></span><span class="sr-only">Thoughts of self-harm</span></label></div>
            </div>
          </details>

          <div class="field">
            <label for="ciNote">Anything you want to remember?</label>
            <textarea class="textarea" id="ciNote" placeholder="One line is enough.">${esc(log.note || '')}</textarea>
          </div>

          <div class="btn-row">
            <button type="submit" class="btn btn-primary">Save check-in</button>
            <button type="button" class="btn" data-action="quick-clean">Quiet day — log nothing else</button>
          </div>
          <p class="tiny muted">This is a log, not a grade. You cannot fail it. Your entries stay on this device.</p>
        </form>
      </section>

      ${renderTrends()}
      ${renderJournal()}
      ${renderGrounding()}

      <section class="card card-soft">
        <div class="card-head"><h2>If you are in danger right now</h2></div>
        <p class="small">Heavy bleeding, severe or one-sided pain, shoulder-tip pain, fainting, chest pain, or trouble breathing → call 911 or go to the ER. Do not wait for a callback.</p>
        <div class="btn-row" style="margin-top:12px"><button class="btn btn-urgent" data-action="open-safety">${I.alert} Open Safety</button><a class="btn" href="tel:988">${I.phone} Call 988</a></div>
      </section>
    </div>`;
}

function sliderField(label, id, val, lo, hi) {
  return `<div class="slider-field">
    <div class="slider-top"><label for="${id}">${label}</label><output class="slider-val" id="${id}Out" for="${id}">${val}</output></div>
    <input type="range" id="${id}" min="0" max="10" step="1" value="${clamp(val, 0, 10)}" aria-describedby="${id}Anchors">
    <div class="slider-anchors" id="${id}Anchors"><span>${lo}</span><span>${hi}</span></div>
  </div>`;
}

function radio(name, value, label, checked) {
  return `<label class="radio-opt"><input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''}><span>${label}</span></label>`;
}

function readCheckin() {
  const spotting = $('#ciSpotting').checked;
  const cramps = $('#ciCramps').checked;
  const spotAmount = $('input[name="spotAmount"]:checked');
  const painLevel = $('input[name="painLevel"]:checked');
  const data = {
    date: todayStr(),
    nausea: Number($('#ciNausea').value),
    fatigue: Number($('#ciFatigue').value),
    anxiety: Number($('#ciAnxiety').value),
    sleepOk: $('#ciSleep').checked,
    spotting: { reported: spotting, amount: spotAmount ? spotAmount.value : null, dizzy: $('#ciSpotDizzy').checked },
    cramps: { reported: cramps, pain: painLevel ? painLevel.value : null, oneSided: $('#ciOneSided').checked, shoulder: $('#ciShoulder').checked, dizzy: $('#ciCrampDizzy').checked },
    fever: $('#ciFever').checked,
    fainted: $('#ciFainted').checked,
    fluidsDown: $('#ciFluids').checked,
    chest: $('#ciChest').checked,
    calf: $('#ciCalf').checked,
    selfHarm: $('#ciSelfHarm').checked,
    note: $('#ciNote').value.trim(),
    savedAt: new Date().toISOString()
  };
  data.tier = computeTier(data);
  const prior = state.logs[data.date] || {};
  data.acknowledged = prior.acknowledged || false;
  data.safetyOpened = prior.safetyOpened || false;
  if (data.tier !== prior.tier) { data.acknowledged = false; data.safetyOpened = false; }
  return data;
}

function computeTier(log) {
  if (log.selfHarm || log.chest || log.fluidsDown || log.fainted) return 2;
  const otherSymptom = log.spotting.reported || log.cramps.reported || log.calf;
  if (log.fever && otherSymptom) return 2;
  if (log.spotting.reported) {
    if (log.spotting.amount === 'heavy' || log.spotting.amount === 'clots' || log.spotting.dizzy) return 2;
    return 1;
  }
  if (log.cramps.reported) {
    if (log.cramps.dizzy || log.cramps.shoulder || log.cramps.oneSided || log.cramps.pain === 'severe') return 2;
    if (log.cramps.pain === 'moderate') return 1;
    return 0;
  }
  if (log.fever) return 1;
  if (log.calf) return 1;
  return -1;
}

function checkinResultHtml(log) {
  if (log.tier === 2) {
    return `<section class="tier-card tier2" role="alert">
      <div class="row-between"><h3>This fits the emergency list. Go now.</h3><span class="pill pill-urgent">Tier 2</span></div>
      <ul style="margin:0;padding-left:18px;display:grid;gap:5px">
        <li>Heavy bleeding — soaking a full pad in an hour or less, clots, or gray/white tissue</li>
        <li>Severe or one-sided pain, or pain with a shoulder-tip ache</li>
        <li>Fainting or near-fainting</li>
        <li>Fever ≥100.4°F / 38°C with any other symptom</li>
        <li>Can't keep fluids down 24 hours, or can't pee normally</li>
        <li>Chest pain, trouble breathing at rest, or coughing blood</li>
      </ul>
      <p class="small">Calling the clinic <strong>and</strong> heading to the ER at the same time is normal and good. Multiple symptoms at once = straight to the ER, not waiting on a callback.</p>
      ${log.selfHarm ? `<div class="callout callout-urgent"><div>${I.heart}</div><div><p class="small"><strong>If you are having thoughts of harming yourself or the pregnancy:</strong> call or text 988 now, tell your OB, or go to the ER. This is a medical emergency, not a character flaw. Help exists during pregnancy.</p><div class="btn-row" style="margin-top:8px"><a class="btn btn-urgent" href="tel:988">${I.phone} Call 988</a><a class="btn" href="sms:988">Text 988</a></div></div></div>` : ''}
      <div class="btn-row"><a class="btn btn-urgent" href="tel:911">${I.phone} Call 911</a><button class="btn" data-action="open-safety">Open Safety</button>${phoneButton('main')}</div>
    </section>`;
  }
  if (log.tier === 1) {
    const reason = log.spotting.reported ? 'You logged spotting. Call the clinic — that\'s the rule, even for the light kind.' : 'You logged moderate cramping — a same-day clinic call fits.';
    const body = log.spotting.reported
      ? 'Most first-trimester bleeding isn\'t a bad sign — roughly 1 pregnancy in 5 sees some — but the clinic still wants every instance reported, and "light or brown" never grants a skip. They have heard this call a hundred times. You will not be the dramatic one.'
      : 'Mild, on-and-off, both-sided, period-like cramping is normal uterine stretching. Moderate but not one-sided isn\'t the ectopic pattern — but "new or different" is worth a human ear today.';
    return `<section class="tier-card tier1" role="alert">
      <div class="row-between"><h3>${reason}</h3><span class="pill pill-warn">Tier 1</span></div>
      <p class="small">${body}</p>
      <div class="btn-row">${phoneButton('main', 'btn-primary')}<button class="btn" data-action="ack-tier1">Log &amp; mention at next visit</button></div>
    </section>`;
  }
  if (log.tier === 0) {
    return `<section class="tier-card tier0">
      <div class="row-between"><h3>Mild cramping is common.</h3><span class="pill pill-primary">Tier 0</span></div>
      <p class="small">Mild, both-sided, on-and-off cramping is common in this stretch — the uterus is stretching. Call if it changes character: worse, one-sided, or with any of the things on the emergency list.</p>
    </section>`;
  }
  return `<section class="tier-card tier0">
    <div class="row-between"><h3>Noted. Feeling quiet is allowed.</h3><span class="pill pill-primary">Logged</span></div>
    <p class="small">Around 70–80% of pregnant people get nausea, which leaves 20–30% who don't — healthy pregnancies land on both sides. If a long-standing symptom suddenly disappears, that is the one version of quiet worth a call.</p>
  </section>`;
}

function renderTrends() {
  const days = [];
  for (let i = 13; i >= 0; i--) days.push(addDays(todayStr(), -i));
  const logs = days.map(d => state.logs[d]).filter(Boolean);
  if (logs.length < 2) {
    return `<section class="card"><div class="card-head"><h2>Trends</h2></div><div class="empty"><strong>Two logged days light this up.</strong>These show what you typed — they don't say anything about the pregnancy.</div></section>`;
  }
  const series = [
    { key: 'nausea', label: 'Nausea', cls: '' },
    { key: 'fatigue', label: 'Fatigue', cls: 'fat' },
    { key: 'anxiety', label: 'Anxiety', cls: 'anx' }
  ];
  return `<section class="card">
    <div class="card-head"><h2>Trends</h2><span class="pill">14 days</span></div>
    <p class="small muted">Neutral lines, no verdicts. These show what you typed — they don't say anything about the pregnancy.</p>
    <div class="trend-grid" style="margin-top:14px">
      ${series.map(s => {
        const vals = days.map(d => { const l = state.logs[d]; return l ? (Number(l[s.key]) || 0) : null; });
        const maxed = vals.map(v => v == null ? 0 : clamp(v / 10 * 100, 3, 100));
        return `<div class="trend-block">
          <div class="row-between"><span class="small" style="font-weight:600">${s.label}</span><span class="tiny muted">0–10</span></div>
          <div class="trend-bars" role="img" aria-label="${s.label} over the last 14 days">
            ${maxed.map((h, i) => `<div class="trend-bar ${s.cls}" title="${days[i]}: ${vals[i] == null ? 'no log' : vals[i]}"><span style="height:${h}%"></span></div>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="trend-legend"><span>${fmtShort(days[0])}</span><span>${fmtShort(days[days.length - 1])}</span></div>
    <p class="spark-note">Only 14 days stay visible — long history is intentionally off. This is a comfort tool, not a monitoring tool.</p>
  </section>`;
}

function renderJournal() {
  const entries = state.journal.slice(-5).reverse();
  return `<section class="card">
    <div class="card-head"><h2>Worry journal</h2><span class="pill">Private</span></div>
    <p class="small muted">Worst-case, written once. What am I afraid of? What is the plan if it happens — even a bad plan calms this.</p>
    <div class="field" style="margin-top:12px">
      <label for="journalText">One worry, one page.</label>
      <textarea class="textarea" id="journalText" placeholder="Write it down once. You don't have to solve it."></textarea>
    </div>
    <div class="btn-row" style="margin-top:10px"><button class="btn btn-sm" data-action="save-journal">Put it down</button></div>
    <div class="setting-block" style="margin-top:12px">
      <div class="row-between"><div><strong class="small">15-minute worry window</strong><div class="tiny muted">Outside it, postponed worries wait for the next one.</div></div>
        <label class="switch"><input type="checkbox" id="worryEnabled" ${state.worryWindow.enabled ? 'checked' : ''}><span class="track"></span><span class="sr-only">Enable worry window</span></label>
      </div>
      <div class="row" style="margin-top:8px"><label class="small" for="worryTime">Window time</label><input class="input" style="width:auto" type="time" id="worryTime" value="${esc(state.worryWindow.time || '17:00')}"><button class="btn btn-sm" data-action="save-worry">Save</button></div>
    </div>
    ${entries.length ? `<div class="stack-sm" style="margin-top:14px">${entries.map(e => `<div class="callout" style="display:block"><div class="tiny muted">${fmtDate(e.date, { month: 'short', day: 'numeric', year: 'numeric' })}</div><p class="small" style="margin-top:4px">${esc(e.text)}</p></div>`).join('')}</div>` : `<p class="tiny muted" style="margin-top:12px">First worry. It's okay to put it down.</p>`}
  </section>`;
}

function renderGrounding() {
  return `<section class="card" id="grounding">
    <div class="card-head"><h2>Grounding</h2><span class="pill pill-blue">2 minutes</span></div>
    <p class="small muted">Box breathing: in for 4, hold 4, out for 4, hold 4. Four rounds. It calms your nervous system in a slightly boring but award-winning way.</p>
    <div class="row" style="margin-top:14px;align-items:center;gap:18px">
      <div id="breathCircle" style="width:92px;height:92px;border-radius:50%;background:var(--primary-soft);border:1px solid var(--primary);display:grid;place-items:center;transition:transform 4s ease-in-out;flex:none">
        <span id="breathText" style="font-weight:650;font-size:.8rem;color:var(--primary-dark);text-align:center">Ready</span>
      </div>
      <div style="flex:1">
        <div class="small" id="breathRound">Four rounds. Nothing to perform.</div>
        <div class="btn-row" style="margin-top:10px"><button class="btn btn-sm btn-primary" data-action="start-breath">Start</button><button class="btn btn-sm" data-action="stop-breath">Stop</button></div>
      </div>
    </div>
    <hr class="divider" style="margin:16px 0">
    <p class="small"><strong>5-4-3-2-1:</strong> Name 5 things you can see. 4 you can touch. 3 you can hear. 2 you can smell. 1 you can taste. Ruminating hates a queue.</p>
    <p class="tiny muted" style="margin-top:8px">If you are having thoughts of harming yourself or the pregnancy, call or text 988, your OB, or go to the ER. Help exists during pregnancy, not just after.</p>
  </section>`;
}

/* ---------------- Baby ---------------- */
function renderBaby() {
  const el = $('#view-baby');
  const w = currentWeek();
  if (selectedWeek == null) selectedWeek = w && w >= 5 && w <= 22 ? w : 6;
  const data = BABY_WEEKS.find(b => b.week === selectedWeek) || BABY_WEEKS[0];
  const isCurrent = w === selectedWeek;

  el.innerHTML = `
    <div class="row-between" style="margin-bottom:16px">
      <div><div class="eyebrow">Your boy, week by week</div><h1>Little One</h1></div>
      <span class="pill pill-accent">${w ? (w > 22 ? 'OB-led' : 'Now: week ' + w) : 'Set your date'}</span>
    </div>
    ${w && w > 22 ? `<div class="banner" style="margin-bottom:14px">${I.info}<span>Your OB is leading now. The week cards end at 22; your care does not.</span></div>` : ''}
    ${w && w < 5 ? `<div class="banner" style="margin-bottom:14px">${I.info}<span>A few days from week 5 — the week cards open then. You can still explore them below.</span></div>` : ''}

    <div class="week-scroller" role="group" aria-label="Choose a week">
      ${BABY_WEEKS.map(b => `<button class="week-chip ${w === b.week ? 'current' : ''}" data-action="select-week" data-arg="${b.week}" aria-pressed="${selectedWeek === b.week}" aria-label="Week ${b.week}">${b.week}</button>`).join('')}
    </div>

    <section class="card" style="margin-top:6px">
      <div class="week-hero">
        <div class="size-orb" aria-hidden="true">${data.week}w</div>
        <div>
          <div class="eyebrow">${isCurrent ? 'This week' : 'Week ' + data.week} · ${esc(data.length)}</div>
          <h2 style="margin-top:2px">${esc(data.size)}</h2>
          <p class="small muted" style="margin-top:2px">Approximate size analogy. Measurements are the real milestone.</p>
        </div>
      </div>
      <div class="stack-sm" style="margin-top:16px">
        <p>${esc(data.body)}</p>
        ${data.boy ? `<div class="callout" style="margin-top:4px"><div style="color:var(--secondary)">${I.info}</div><div><div class="eyebrow">Boy note</div><p class="small" style="margin-top:3px">${esc(data.boy)}</p></div></div>` : ''}
        ${data.caveat ? `<p class="small muted"><strong>Not visible yet / caveat:</strong> ${esc(data.caveat)}</p>` : ''}
        <div class="callout" style="margin-top:4px"><div style="color:var(--accent)">${I.heart}</div><div><div class="eyebrow">Gentle focus</div><p class="small" style="margin-top:3px">${esc(data.focus)}</p></div></div>
        ${state.profile.lossHistory ? `<p class="tiny muted">You're here at ${data.week} weeks. The next check is ${nextAppointment() ? fmtShort(nextAppointment().date) : 'not scheduled yet'}. Between checks: this week's gentle focus, and one text to a person who gets it.</p>` : ''}
      </div>
    </section>

    <section class="card card-soft" style="margin-top:16px">
      <div class="card-head"><h2>Milestones worth marking</h2><span class="pill">Quiet wins</span></div>
      <div class="timeline">
        ${milestoneItem('Transfer day', 'A day-5 blast, on schedule. This is the starting point a healthy pregnancy is meant to begin from.', 0)}
        ${milestoneItem('First beta', 'The first number is in. From here, the trend does the talking.', 10)}
        ${milestoneItem('First heartbeat', 'The moment ultrasound takes over from betas — intended, not lucky.', 26)}
        ${milestoneItem('Graduation to OB', 'Your RE handed you to your OB with your notes. The lead role changes; the relationship doesn\'t have to end.', 44)}
        ${milestoneItem('Testosterone ramp', 'A quietly boy-specific window: 8 to 12 weeks. The baby never notices.', 37)}
        ${milestoneItem('Anatomy scan', 'The structural check and the visual confirmation of what NIPT pointed at.', 121)}
      </div>
    </section>

    <section class="card" style="margin-top:16px">
      <div class="card-head"><h2>The boy-specific note</h2></div>
      <p class="small">NIPT reads Y-chromosome DNA from the placenta. With an adequate fetal fraction, a "male" result is about <strong>98–99% accurate</strong> — excellent, but still a screen. First-trimester ultrasound cannot reliably distinguish genitalia, and a "12-week nub" guess is not a method. The <strong>18–22-week anatomy scan</strong> is the visual confirmation.</p>
    </section>

    <p class="tiny muted center" style="margin-top:14px">Size analogies are approximate. Your clinic's measurements and scan reports are the real record.</p>`;
}

function milestoneItem(title, body, offset) {
  const g = ga();
  const done = g && !g.future && g.dpt >= offset;
  return `<div class="tl-item ${done ? 'done' : ''}">
    <div class="tl-dot">${done ? I.check : ''}</div>
    <div class="tl-body"><div class="tl-title">${esc(title)}</div><div class="tl-meta">${esc(body)}</div></div>
  </div>`;
}

/* ---------------- Learn ---------------- */
function renderLearn() {
  const el = $('#view-learn');
  el.innerHTML = `
    <div class="row-between" style="margin-bottom:16px">
      <div><div class="eyebrow">Plain language</div><h1>Learn</h1></div>
      <button class="btn btn-sm" data-action="goto-today">Back to Today</button>
    </div>
    <p class="small muted" style="margin-bottom:14px">Twelve questions that tend to show up at 2 a.m. Each one ends with when to call.</p>
    <div class="stack-sm">
      ${FAQS.map((f, i) => `<details class="faq"><summary>${i + 1}. ${esc(f.q)}</summary><div class="faq-body"><p>${esc(f.a)}</p><p class="small"><strong>Call your clinic if…</strong> ${esc(f.call)}</p></div></details>`).join('')}
    </div>
    <section class="card card-soft" style="margin-top:18px">
      <div class="card-head"><h2>Still not sure?</h2></div>
      <p class="small">Uncertainty always counts as a reason to call. You will not be "the dramatic one."</p>
      <div class="btn-row" style="margin-top:12px">${phoneButton('main', 'btn-primary')}<button class="btn" data-action="open-safety">${I.alert} Safety</button></div>
    </section>`;
}

/* ---------------- Safety ---------------- */
function renderSafety(contextTier = 2) {
  const open = clinicOpenNow();
  const body = $('#safetyBody');
  const clinicLine = !state.profile.clinicPhone && !state.profile.afterHoursPhone
    ? `<div class="banner">${I.info}<span>No clinic number saved yet. Add it in Settings — it becomes the call button on every card.</span></div>`
    : `<p class="tiny muted">${open ? 'Your clinic is likely open now. If you are unsure, call the main line.' : 'Your clinic is likely closed now. Use the after-hours line if you have one; if not, the main line recording usually routes you.'}</p>`;

  body.innerHTML = `
    <div class="tier-card tier2" id="tier2Panel">
      <div class="row-between"><h3>Go now. This fits the emergency list.</h3><span class="pill pill-urgent">Tier 2</span></div>
      <ul style="margin:0;padding-left:18px;display:grid;gap:5px">
        <li>Heavy bleeding — soaking a full pad in an hour or less, clots, or gray/white tissue.</li>
        <li>Severe or one-sided pain, or pain with a shoulder-tip ache.</li>
        <li>Fainting or near-fainting.</li>
        <li>Fever of 100.4°F / 38°C or higher with any other symptom.</li>
        <li>Can't keep fluids down for 24 hours, or can't pee normally.</li>
        <li>Chest pain, trouble breathing at rest, or coughing blood.</li>
      </ul>
      <div class="btn-row">
        <a class="btn btn-urgent" href="tel:911">${I.phone} Call 911</a>
        ${state.profile.clinicPhone ? `<a class="btn" href="tel:${esc(sanitizePhone(state.profile.clinicPhone))}">${I.phone} Call clinic</a>` : `<button class="btn" data-action="open-settings">Add clinic number</button>`}
        ${state.profile.afterHoursPhone ? `<a class="btn" href="tel:${esc(sanitizePhone(state.profile.afterHoursPhone))}">${I.phone} After hours</a>` : ''}
      </div>
      <p class="small"><strong>Go to the nearest ER.</strong> If you feel faint, do not drive yourself — call 911. Calling the clinic and heading to the ER at the same time is normal and good. Multiple symptoms at once = straight to the ER, not waiting on a callback.</p>
    </div>

    <div>
      <div class="eyebrow">Tier 1 — call your clinic today</div>
      <p class="small" style="margin-top:6px">It is not an emergency — but these all get a call, and uncertainty always counts:</p>
      <ul class="small" style="margin:8px 0 0;padding-left:18px;display:grid;gap:4px">
        <li>Any spotting or bleeding, light or brown, once or ongoing.</li>
        <li>New or different cramping; moderate pain.</li>
        <li>Foul-smelling discharge, especially after a procedure.</li>
        <li>Fever that stays up 24 hours, any level.</li>
        <li>Can keep fluids down but nothing else — food won't stay.</li>
        <li>A calf that is suddenly warm, swollen, or painful on one side.</li>
        <li>Anxiety you can't work, eat, or sleep through; scary intrusive thoughts.</li>
      </ul>
      <div class="btn-row" style="margin-top:12px">
        ${phoneButton('main', 'btn-primary')}
        ${state.profile.afterHoursPhone ? phoneButton('after') : ''}
      </div>
      ${clinicLine}
    </div>

    <div class="callout callout-urgent">
      <div>${I.heart}</div>
      <div>
        <p><strong>If you're having thoughts of harming yourself or the pregnancy,</strong> that's a medical emergency, not a character flaw. Call or text <strong>988</strong>, your OB, or go to the ER. Help exists during pregnancy, not just after.</p>
        <div class="btn-row" style="margin-top:10px"><a class="btn btn-urgent" href="tel:988">${I.phone} Call 988</a><a class="btn" href="sms:988">Text 988</a></div>
      </div>
    </div>

    <p class="tiny muted">This panel is education, not medical advice. Your clinic's instructions always outrank anything here.</p>`;

  const modal = $('#safetyModal');
  if (!modal.open) modal.showModal();
  const panel = $('#tier2Panel');
  if (panel) panel.scrollIntoView({ block: 'start' });
}

/* ---------------- Missed dose ---------------- */
function openMissed(medId) {
  const meds = state.meds.filter(m => m.active !== false);
  const body = $('#missedBody');
  if (!meds.length) {
    body.innerHTML = `<div class="empty"><strong>No medications set.</strong>Add them in Settings whenever you're ready.<div style="margin-top:10px"><button class="btn btn-sm" data-action="open-settings">Open Settings</button></div></div>`;
  } else {
    body.innerHTML = `
      <p class="small"><strong>You missed a dose. This happens, and it's fixable.</strong> Three quick questions, then the right path. Nothing here is a grade.</p>
      <div class="field">
        <label for="missedMed">Which medication?</label>
        <select class="select" id="missedMed">${meds.map(m => `<option value="${esc(m.id)}" ${m.id === medId ? 'selected' : ''}>${esc(m.name)} · ${timeLabel(m.time)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <div class="field-label">Roughly how long ago?</div>
        <div class="radio-group" role="radiogroup" aria-label="How long ago">
          ${radio('missGap', 'lt2', 'Under 2 hours', false)}
          ${radio('missGap', '2to8', '2–8 hours', false)}
          ${radio('missGap', '8to24', '8–24 hours', false)}
          ${radio('missGap', 'gt24', 'More than a day', false)}
        </div>
      </div>
      <div class="field" id="doubleField">
        <div class="field-label">Have you already taken anything extra about it?</div>
        <div class="radio-group" role="radiogroup" aria-label="Took extra">
          ${radio('missDouble', 'no', 'No', true)}
          ${radio('missDouble', 'yes', 'I took something extra — a double', false)}
        </div>
      </div>
      <div class="btn-row"><button class="btn btn-primary" data-action="missed-continue">Continue</button></div>
      <p class="tiny muted">Never take two doses to make up one. Never stop a hormone cold turkey. When in doubt, call.</p>`;
  }
  const modal = $('#missedModal');
  if (!modal.open) modal.showModal();
}

function missedContinue() {
  const medId = $('#missedMed').value;
  const med = state.meds.find(m => m.id === medId);
  const gapEl = $('input[name="missGap"]:checked');
  const doubleEl = $('input[name="missDouble"]:checked');
  const gap = gapEl ? gapEl.value : null;
  const doubled = doubleEl && doubleEl.value === 'yes';
  const body = $('#missedBody');

  if (!gap) { toast('Pick how long ago it was — one tap.'); return; }
  if (doubled) {
    body.innerHTML = `
      <div class="tier-card tier2">
        <h3>Don't take more. Call the clinic now.</h3>
        <p class="small">A double dose is a clinic call, not a wait-and-see. They will tell you what to watch for. If you feel unwell — dizzy, short of breath, very sleepy — call 911.</p>
        <div class="btn-row">${phoneButton('main', 'btn-primary')}${phoneButton('after')}<a class="btn btn-urgent" href="tel:911">${I.phone} Call 911</a></div>
      </div>
      <div class="btn-row"><button class="btn" data-action="close-modal">Back to Today</button></div>`;
    return;
  }

  const isPIO = isPIOMed(med);
  const hormonal = med && (med.isHormonal || med.name.toLowerCase().includes('progesterone') || med.name.toLowerCase().includes('estradiol'));

  if (isPIO) {
    body.innerHTML = `
      <div class="stack-sm">
        <h3>A missed PIO dose is a clinic call, not a guessing game.</h3>
        <p class="small">They'll either say <strong>skip-and-resume</strong>, or <strong>take it late</strong>. Never a double dose; never stop cold turkey.</p>
        <details class="faq" open><summary>What the call will likely cover</summary><div class="faq-body"><p class="small">Two common answers from clinics: (1) skip the missed dose and take tomorrow's on schedule, or (2) take today's dose late and keep the normal schedule after. Which one they pick depends on their protocol and how late it is. You don't need to pick in advance — have your schedule open and read them your timing.</p></div></details>
        <div class="banner">${I.info}<span>Call the clinic even if it is after hours. They staff this exact call.</span></div>
        <div class="btn-row">${phoneButton('main', 'btn-primary')}${phoneButton('after')}</div>
        <button class="btn" data-action="copy-missed-note" data-arg="${esc(med.id)}">Copy a note for the call</button>
        <p class="tiny muted">Never two doses to make up one. Never stop cold turkey.</p>
        <div class="btn-row"><button class="btn" data-action="close-modal">Back to Today</button></div>
      </div>`;
    return;
  }

  if (hormonal && gap === 'gt24') {
    body.innerHTML = `
      <div class="tier-card tier1">
        <h3>Off a hormone for more than a day: call before restarting.</h3>
        <p class="small">Don't restart with a double. The clinic will set the resume plan. This is a two-minute call, not an alarm.</p>
        <div class="btn-row">${phoneButton('main', 'btn-primary')}${phoneButton('after')}</div>
      </div>
      <p class="tiny muted">Antibiotics, antifungals, opioids, and other prescriptions can interact with IVF support meds — mention the regimen to every prescriber. [VERIFY LOCALLY with your clinic's interaction list]</p>
      <div class="btn-row"><button class="btn" data-action="close-modal">Back to Today</button></div>`;
    return;
  }

  if (gap === 'gt24') {
    body.innerHTML = `
      <div class="tier-card tier0">
        <h3>Skip this one and resume at the next scheduled time.</h3>
        <p class="small">For aspirin or a prenatal, a missed day is not an emergency. Do not take two to catch up. Mention it at your next visit.</p>
        <div class="btn-row"><button class="btn btn-primary" data-action="close-modal">Back to Today</button></div>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div class="tier-card tier0">
      <h3>Take it now — today is still "the day."</h3>
      <p class="small">Keep the regular rhythm after this. Never take two to catch up. If this is progesterone or estrogen and it has been more than 24 hours, call before restarting.</p>
      <div class="btn-row"><button class="btn btn-primary" data-action="take-late" data-arg="${esc(med.id)}">Mark taken now</button><button class="btn" data-action="close-modal">Back to Today</button></div>
    </div>
    <p class="tiny muted">Antibiotics, antifungals, opioids, and other prescriptions can interact with IVF support meds — mention the regimen to every prescriber. [VERIFY LOCALLY]</p>`;
}

function copyMissedNote(medId) {
  const med = state.meds.find(m => m.id === medId);
  const g = ga();
  const text = `I'm ${g ? g.label : 'post-transfer'}. I take ${med ? med.name + ' ' + (med.dose || '') : 'a medication'} at ${med ? timeLabel(med.time) : 'my scheduled time'}. I missed the dose on ${fmtDate(todayStr())}. What do you want me to do — skip-and-resume or take it late? I won't double up without your say-so.`;
  copyText(text);
}

/* ---------------- Journal / grounding ---------------- */
function saveJournal() {
  const text = $('#journalText').value.trim();
  if (!text) { toast('Write one line first. Even a fragment.'); return; }
  state.journal.push({ date: todayStr(), text, at: new Date().toISOString() });
  save();
  toast('Put down. You can close the page now.');
  renderCheckin();
}

function startBreathing() {
  stopBreathing();
  const phases = [
    { label: 'In', scale: 1.25, secs: 4 },
    { label: 'Hold', scale: 1.25, secs: 4 },
    { label: 'Out', scale: .85, secs: 4 },
    { label: 'Hold', scale: .85, secs: 4 }
  ];
  let phase = 0, left = 4, round = 1;
  const text = $('#breathText'), circ = $('#breathCircle'), roundEl = $('#breathRound');
  if (!text || !circ) return;
  circ.style.transform = 'scale(1)';
  const tick = () => {
    const p = phases[phase];
    text.textContent = `${p.label} ${left}`;
    circ.style.transform = `scale(${p.scale})`;
    left--;
    if (left < 0) {
      phase++;
      if (phase >= phases.length) { phase = 0; round++; }
      left = 4;
      if (round > 4) {
        stopBreathing();
        text.textContent = 'Done';
        circ.style.transform = 'scale(1)';
        if (roundEl) roundEl.textContent = 'Four rounds. That was enough.';
        return;
      }
    }
    if (roundEl) roundEl.textContent = `Round ${Math.min(round, 4)} of 4 · ${phases[phase].label.toLowerCase()} for 4`;
  };
  tick();
  breathTimer = setInterval(tick, 1000);
}

function stopBreathing() {
  if (breathTimer) { clearInterval(breathTimer); breathTimer = null; }
  const text = $('#breathText');
  if (text && text.textContent !== 'Done') text.textContent = 'Ready';
}

/* ---------------- Settings ---------------- */
function renderSettings() {
  const body = $('#settingsBody');
  const p = state.profile;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  body.innerHTML = `
    <p class="small muted">The app follows your protocol. It does not prescribe one. Every date and dose is editable, and everything stays on this device.</p>

    <div class="setting-block">
      <div class="section-title"><h3>Pregnancy profile</h3><span class="pill">Core</span></div>
      <div class="field">
        <label for="setTransfer">Transfer date</label>
        <input class="input" type="date" id="setTransfer" value="${esc(p.transferDate || '')}" max="${todayStr()}">
        <div class="hint">EDD auto-calculates: transfer + 261 days. Day-5 blastocyst.</div>
      </div>
      <label class="checked-line"><input type="checkbox" id="setLossHistory" ${p.lossHistory ? 'checked' : ''}><span class="small">I want the gentle loss-history variant on week cards.</span></label>
      <div class="field"><label for="setNotes">My protocol notes</label><textarea class="textarea" id="setNotes" placeholder="Doses, stop weeks, pelvic rest, exercise limits…">${esc(p.notes || '')}</textarea></div>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Clinic &amp; after hours</h3><span class="pill pill-urgent">Safety</span></div>
      <div class="field"><label for="setClinicName">Clinic name</label><input class="input" id="setClinicName" value="${esc(p.clinicName || '')}" autocomplete="off"></div>
      <div class="field"><label for="setClinicPhone">Main line</label><input class="input" id="setClinicPhone" type="tel" value="${esc(p.clinicPhone || '')}" placeholder="+1 555 010 0000"></div>
      <div class="field"><label for="setAfterPhone">After-hours line (optional)</label><input class="input" id="setAfterPhone" type="tel" value="${esc(p.afterHoursPhone || '')}" placeholder="+1 555 010 0001"><div class="hint">If you don't have it, the main line usually records it after closing.</div></div>
      <div class="input-row">
        <div class="field"><label for="setHoursStart">Clinic opens</label><input class="input" type="time" id="setHoursStart" value="${esc(p.hoursStart || '09:00')}"></div>
        <div class="field"><label for="setHoursEnd">Clinic closes</label><input class="input" type="time" id="setHoursEnd" value="${esc(p.hoursEnd || '17:00')}"></div>
      </div>
      <div class="field"><div class="field-label">Clinic days</div><div class="row" style="gap:6px">${days.map((d, i) => `<label class="pill" style="cursor:pointer;padding:7px 10px"><input type="checkbox" class="setDay" value="${i}" ${(Array.isArray(p.days) ? p.days : [1, 2, 3, 4, 5]).includes(i) ? 'checked' : ''} style="margin-right:6px;accent-color:var(--primary)">${d}</label>`).join('')}</div></div>
      <div class="field"><label for="setGradWeek">Graduation week (if known)</label><input class="input" id="setGradWeek" type="number" min="6" max="14" value="${p.graduationWeek || ''}" placeholder="e.g. 10"><div class="hint">Ask: "What week do I graduate, and what gets sent to the OB?"</div></div>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Support person</h3><span class="pill">Optional</span></div>
      <div class="input-row">
        <div class="field"><label for="setSupportName">Name</label><input class="input" id="setSupportName" value="${esc(p.supportName || '')}"></div>
        <div class="field"><label for="setSupportPhone">Phone</label><input class="input" id="setSupportPhone" type="tel" value="${esc(p.supportPhone || '')}"></div>
      </div>
      <button type="button" class="btn btn-sm" data-action="copy-update">Copy an update to send</button>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Medications</h3><span class="pill">${state.meds.length} tracked</span></div>
      <div class="stack-sm" id="medEditor">
        ${state.meds.map((m, i) => medEditorRow(m, i)).join('') || '<p class="small muted">No medications yet. Add them whenever. Nothing broke.</p>'}
      </div>
      <button type="button" class="btn btn-sm" data-action="add-med">+ Add medication</button>
      <p class="tiny muted">Add and remove apply immediately; the Save button applies the other fields.</p>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Appointment dates</h3><span class="pill">Editable</span></div>
      ${state.appointments.slice().sort((a, b) => a.date.localeCompare(b.date)).map(a => `<div class="field"><label for="appt-${esc(a.id)}">${esc(a.label)} <span class="tiny muted">(${esc(a.window || '')})</span></label><input class="input" type="date" id="appt-${esc(a.id)}" data-appt="${esc(a.id)}" value="${esc(a.date)}"></div>`).join('') || '<p class="small muted">Set a transfer date and typical appointments will appear here.</p>'}
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Preferences</h3></div>
      <div class="field"><label for="setTheme">Appearance</label><select class="select" id="setTheme"><option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="system" ${state.settings.theme === 'system' ? 'selected' : ''}>Follow system</option></select><div class="hint">Dark mode helps at 2 a.m.; deliberately calm either way.</div></div>
      <label class="checked-line"><input type="checkbox" id="setCelebrations" ${state.settings.celebrations ? 'checked' : ''}><span class="small">Quiet milestone celebrations.</span></label>
      <label class="checked-line"><input type="checkbox" id="setNotifications" ${state.settings.notifications ? 'checked' : ''}><span class="small">Best-effort reminders (this offline file cannot guarantee notifications).</span></label>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Learn / FAQ</h3><span class="pill">12 answers</span></div>
      <p class="small muted">Spotting, no symptoms, beta numbers, missed PIO, NIPT no-call, pelvic rest, food safety, anxiety at 2 a.m. Each answer ends with when to call.</p>
      <button type="button" class="btn btn-sm" data-action="goto-learn">Open Learn / FAQ</button>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Data &amp; privacy</h3><span class="pill pill-primary">On-device</span></div>
      <p class="small muted">Everything lives on this device only. No accounts, no analytics, no internet calls. Opened without Wi-Fi? Still works.</p>
      <p class="tiny muted">If you open this file from a phone's Files app, saved data can occasionally vanish on some devices — a one-tap export to Notes is cheap insurance.</p>
      <div class="field"><label for="exportBox">Your data (JSON)</label><textarea class="textarea" id="exportBox" readonly style="font-family:ui-monospace,monospace;font-size:.72rem;min-height:90px">${esc(JSON.stringify(state, null, 2))}</textarea></div>
      <div class="btn-row"><button type="button" class="btn btn-sm" data-action="copy-export">Copy my data</button><button type="button" class="btn btn-sm" data-action="print">${I.print} Print</button></div>
      <div class="field" style="margin-top:10px"><label for="importBox">Restore from a copy</label><textarea class="textarea" id="importBox" placeholder="Paste the whole JSON block — starting with { and ending with }." style="font-family:ui-monospace,monospace;font-size:.72rem"></textarea></div>
      <button type="button" class="btn btn-sm" data-action="restore-import">Preview &amp; restore</button>
    </div>

    <div class="setting-block">
      <div class="section-title"><h3>Start over</h3></div>
      <p class="small muted">Gone means gone — there is no server holding a copy. Export first if you might want it back.</p>
      <div class="row"><input class="input" id="resetConfirm" placeholder="Type RESET" style="max-width:200px"><button type="button" class="btn btn-sm" data-action="reset-data">Erase everything</button></div>
    </div>

    <p class="tiny muted">Education, not medical advice. Your clinic's instructions always outrank anything here. [VERIFY LOCALLY]</p>`;
}

function medEditorRow(m, i) {
  return `<div class="med-edit" data-med-index="${i}">
    <div class="row-between"><strong class="small">${esc(m.name || 'New medication')}</strong><button type="button" class="link-btn" data-action="remove-med" data-arg="${esc(m.id)}">Remove</button></div>
    <div class="med-edit-grid">
      <div class="field"><label>Name</label><input class="input" data-field="name" value="${esc(m.name || '')}"></div>
      <div class="field"><label>Dose</label><input class="input" data-field="dose" value="${esc(m.dose || '')}" placeholder="50 mg"></div>
      <div class="field"><label>Time</label><input class="input" type="time" data-field="time" value="${esc(m.time || '09:00')}"></div>
    </div>
    <div class="med-edit-grid">
      <div class="field"><label>Route</label><input class="input" data-field="route" value="${esc(m.route || '')}" placeholder="IM / oral / vaginal"></div>
      <div class="field"><label>Stop week</label><input class="input" type="number" min="4" max="20" data-field="stopWeek" value="${m.stopWeek || ''}" placeholder="per RE"></div>
      <div class="field"><label>Days on hand</label><input class="input" type="number" min="0" max="90" data-field="supplyDays" value="${m.supplyDays ?? ''}" placeholder="14"></div>
    </div>
    <label class="checked-line" style="padding:0"><input type="checkbox" data-field="isHormonal" ${m.isHormonal ? 'checked' : ''}><span class="tiny">This is a hormonal medication (PIO, progesterone, estrogen).</span></label>
  </div>`;
}

function collectSettings() {
  const p = state.profile;
  const get = id => { const el = $('#' + id); return el ? el.value.trim() : ''; };
  p.transferDate = get('setTransfer') || null;
  p.lossHistory = $('#setLossHistory') ? $('#setLossHistory').checked : p.lossHistory;
  p.notes = get('setNotes');
  p.clinicName = get('setClinicName');
  p.clinicPhone = get('setClinicPhone');
  p.afterHoursPhone = get('setAfterPhone');
  p.hoursStart = get('setHoursStart') || '09:00';
  p.hoursEnd = get('setHoursEnd') || '17:00';
  p.days = $$('.setDay').filter(c => c.checked).map(c => Number(c.value));
  p.graduationWeek = get('setGradWeek') ? Number(get('setGradWeek')) : null;
  p.supportName = get('setSupportName');
  p.supportPhone = get('setSupportPhone');
  state.settings.theme = get('setTheme') || 'light';
  state.settings.celebrations = $('#setCelebrations') ? $('#setCelebrations').checked : true;
  state.settings.notifications = $('#setNotifications') ? $('#setNotifications').checked : true;

  $$('.med-edit').forEach((row, i) => {
    const m = state.meds[i];
    if (!m) return;
    const val = f => { const el = row.querySelector(`[data-field="${f}"]`); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
    m.name = val('name') || 'Medication';
    m.dose = val('dose');
    m.route = val('route');
    m.time = val('time') || '09:00';
    m.stopWeek = val('stopWeek') ? Number(val('stopWeek')) : null;
    m.supplyDays = val('supplyDays') ? Number(val('supplyDays')) : null;
    m.isHormonal = !!val('isHormonal');
    m.active = m.active !== false;
  });
  $$('[data-appt]').forEach(inp => {
    const a = state.appointments.find(x => x.id === inp.dataset.appt);
    if (a && inp.value) a.date = inp.value;
  });
}

function saveSettings(e) {
  if (e) e.preventDefault();
  const before = state.profile.transferDate;
  collectSettings();
  if (state.profile.transferDate && state.profile.transferDate !== before) {
    ensureAppointments(true);
  } else if (state.profile.transferDate) {
    ensureAppointments(false);
  } else {
    state.appointments = [];
  }
  save();
  closeModal();
  applyTheme();
  renderChrome();
  switchView(currentView, false);
  toast(state.profile.demo ? 'Demo mode — nothing saves. On a real profile, this would save.' : 'Saved. The dashboard follows your protocol.');
}

function addMed() {
  collectSettings();
  state.meds.push({
    id: 'med-' + Date.now(), name: 'New medication', dose: '', route: '',
    time: '09:00', stopWeek: null, supplyDays: null, supplyAsOf: todayStr(),
    isHormonal: false, active: true, orderedAt: null, createdAt: todayStr()
  });
  save();
  renderSettings();
}

function removeMed(id) {
  collectSettings();
  state.meds = state.meds.filter(m => m.id !== id);
  save();
  renderSettings();
}

function supplyInfo(med) {
  if (med.supplyDays == null) return null;
  const asOf = med.supplyAsOf || todayStr();
  const days = Math.max(0, Number(med.supplyDays) - diffDays(todayStr(), asOf));
  const ordered = med.orderedAt && diffDays(todayStr(), med.orderedAt) <= 3;
  return { days, ordered };
}

function lowestSupply() {
  const list = state.meds.filter(m => m.active !== false && m.supplyDays != null).map(m => {
    const s = supplyInfo(m);
    return { ...m, days: s.days, ordered: s.ordered };
  }).sort((a, b) => a.days - b.days);
  return list[0] || null;
}

function lastDoseDate() {
  const dates = Object.keys(state.doses).filter(d => Object.values(state.doses[d] || {}).some(x => x.taken)).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

/* ---------------- Onboarding ---------------- */
function renderOnboarding() {
  const box = $('#obBody');
  const prog = $('#obProgress');
  if (prog) prog.innerHTML = [1, 2, 3].map(n => `<span class="${n <= obStep ? 'on' : ''}"></span>`).join('');
  if (obStep === 1) {
    box.innerHTML = `
      <div class="eyebrow">A calm place to land</div>
      <h1 style="margin-top:6px">Welcome. Let's set the basics — 60 seconds, and none of it is graded.</h1>
      <p class="lede" style="margin-top:10px">The app only needs one date to be useful: your transfer date. Everything else is optional and editable later in Settings.</p>
      <div class="field" style="margin-top:18px">
        <label for="obTransfer">Transfer date</label>
        <input class="input" type="date" id="obTransfer" max="${todayStr()}" value="${esc(obData.transferDate || '')}">
        <div class="hint">Your due date comes from this: transfer day + 261 days. That's the standard math for a day-5 blastocyst.</div>
      </div>
      <div class="btn-row" style="margin-top:18px">
        <button class="btn btn-primary" data-action="ob-next">Get started</button>
        <button class="btn" data-action="start-demo">Explore demo mode</button>
      </div>
      <button class="link-btn" data-action="ob-skip" style="margin-top:10px">Skip for now</button>
      <p class="tiny muted" style="margin-top:14px">Everything lives on this device only. No accounts, no analytics, no internet calls. Opened without Wi-Fi? Still works.</p>`;
  } else if (obStep === 2) {
    box.innerHTML = `
      <div class="eyebrow">Step 2 of 3</div>
      <h1 style="margin-top:6px">Who do you call?</h1>
      <p class="lede" style="margin-top:10px">This becomes the call button on every safety card. Optional, but it earns its place.</p>
      <div class="field" style="margin-top:18px"><label for="obClinicName">Clinic name</label><input class="input" id="obClinicName" value="${esc(obData.clinicName || '')}" placeholder="e.g. Lakeside Reproductive Health"></div>
      <div class="field"><label for="obClinicPhone">Main line</label><input class="input" type="tel" id="obClinicPhone" value="${esc(obData.clinicPhone || '')}" placeholder="+1 555 010 0000"></div>
      <div class="field"><label for="obAfterPhone">After-hours line (optional)</label><input class="input" type="tel" id="obAfterPhone" value="${esc(obData.afterHoursPhone || '')}" placeholder="+1 555 010 0001"></div>
      <p class="tiny muted" style="margin-top:8px">If you don't have the after-hours number handy, the main number usually records it after closing.</p>
      <div class="btn-row" style="margin-top:18px"><button class="btn btn-primary" data-action="ob-next">Continue</button><button class="btn" data-action="ob-back">Back</button></div>
      <button class="link-btn" data-action="ob-skip" style="margin-top:10px">Skip for now</button>`;
  } else {
    const templates = [
      { id: 'pio', name: 'Progesterone in oil (PIO)', dose: '50 mg', route: 'IM', time: '20:00', isHormonal: true, stopWeek: null, supplyDays: 14 },
      { id: 'prog', name: 'Vaginal progesterone', dose: '200 mg', route: 'vaginal', time: '08:00', isHormonal: true, stopWeek: null, supplyDays: 14 },
      { id: 'est', name: 'Estradiol', dose: '2 mg', route: 'oral', time: '09:00', isHormonal: true, stopWeek: null, supplyDays: 14 },
      { id: 'asa', name: 'Low-dose aspirin', dose: '81 mg', route: 'oral', time: '09:00', isHormonal: false, stopWeek: null, supplyDays: 30 },
      { id: 'prenatal', name: 'Prenatal vitamin', dose: '1 tab', route: 'oral', time: '09:00', isHormonal: false, stopWeek: null, supplyDays: 30 }
    ];
    box.innerHTML = `
      <div class="eyebrow">Step 3 of 3</div>
      <h1 style="margin-top:6px">Your medications</h1>
      <p class="lede" style="margin-top:10px">Pick any that match. These are <strong>examples</strong> — set the dose and time exactly as your clinic prescribed. Leave stop week blank until your RE tells you one.</p>
      <div class="choice-grid" style="margin-top:18px">
        ${templates.map(t => `<label class="choice"><input type="checkbox" class="obMed" value="${t.id}" ${obData.meds.includes(t.id) ? 'checked' : ''}><span><span class="t">${t.name}</span><span class="s">${t.route} · ${t.dose} · ${timeLabel(t.time)} · example only</span></span></label>`).join('')}
      </div>
      <p class="tiny muted" style="margin-top:10px">Missing one? Add it later in Settings. Nothing broke.</p>
      <div class="btn-row" style="margin-top:18px"><button class="btn btn-primary" data-action="ob-finish">Finish setup</button><button class="btn" data-action="ob-back">Back</button></div>
      <button class="link-btn" data-action="ob-skip" style="margin-top:10px">Skip — no meds yet</button>`;
  }
  const onboarding = $('#onboarding');
  if (onboarding) onboarding.hidden = false;
  const first = box.querySelector('input, button');
  if (first) setTimeout(() => first.focus(), 60);
}

function obNext() {
  if (obStep === 1) {
    const val = $('#obTransfer').value;
    if (val && val > todayStr()) { toast('That date is in the future. Is it possible the day got mistyped?'); return; }
    obData.transferDate = val;
    obStep = 2;
  } else if (obStep === 2) {
    obData.clinicName = $('#obClinicName').value.trim();
    obData.clinicPhone = $('#obClinicPhone').value.trim();
    obData.afterHoursPhone = $('#obAfterPhone').value.trim();
    obStep = 3;
  }
  renderOnboarding();
}

function obBack() { if (obStep > 1) { obStep--; renderOnboarding(); } }

function obFinish() {
  const selected = $$('.obMed').filter(c => c.checked).map(c => c.value);
  obData.meds = selected;
  state = freshState();
  state.profile.transferDate = obData.transferDate || null;
  state.profile.clinicName = obData.clinicName || '';
  state.profile.clinicPhone = obData.clinicPhone || '';
  state.profile.afterHoursPhone = obData.afterHoursPhone || '';
  state.profile.onboarded = true;
  state.meds = buildTemplateMeds(selected);
  if (state.profile.transferDate) ensureAppointments(true);
  save();
  $('#onboarding').hidden = true;
  renderChrome();
  switchView('today');
  toast('You\'re set. Settings fixes anything in ten seconds.');
}

function buildTemplateMeds(ids) {
  const templates = {
    pio: { name: 'Progesterone in oil (PIO)', dose: '50 mg', route: 'IM', time: '20:00', isHormonal: true },
    prog: { name: 'Vaginal progesterone', dose: '200 mg', route: 'vaginal', time: '08:00', isHormonal: true },
    est: { name: 'Estradiol', dose: '2 mg', route: 'oral', time: '09:00', isHormonal: true },
    asa: { name: 'Low-dose aspirin', dose: '81 mg', route: 'oral', time: '09:00', isHormonal: false },
    prenatal: { name: 'Prenatal vitamin', dose: '1 tab', route: 'oral', time: '09:00', isHormonal: false }
  };
  return ids.map(id => ({
    id, ...templates[id], stopWeek: null, supplyDays: 14, supplyAsOf: todayStr(),
    active: true, orderedAt: null, createdAt: todayStr()
  }));
}

function startDemo() {
  const transfer = addDays(todayStr(), -28);
  state = freshState();
  state.profile = {
    ...state.profile, demo: true, onboarded: true, transferDate: transfer,
    clinicName: 'Demo Clinic', clinicPhone: '', afterHoursPhone: '',
    graduationWeek: null, supportName: 'Sam', lossHistory: false
  };
  state.meds = buildTemplateMeds(['pio', 'est', 'prenatal']);
  ensureAppointments(true);
  const yesterday = addDays(todayStr(), -1);
  state.logs[yesterday] = {
    date: yesterday, nausea: 3, fatigue: 6, anxiety: 4, sleepOk: false,
    spotting: { reported: false, amount: null, dizzy: false },
    cramps: { reported: false, pain: null, oneSided: false, shoulder: false, dizzy: false },
    fever: false, fainted: false, fluidsDown: false, chest: false, calf: false, selfHarm: false,
    note: '', tier: -1, savedAt: new Date().toISOString()
  };
  state.meta.lastOpened = new Date().toISOString();
  $('#onboarding').hidden = true;
  applyTheme();
  renderChrome();
  switchView('today');
  toast('Demo mode. Poke around — nothing saves.');
}

function exitDemo() {
  state = freshState();
  selectedWeek = null;
  $('#demoBanner').hidden = true;
  startOnboarding();
  renderChrome();
}

/* ---------------- Actions ---------------- */
function baseLog(date = todayStr()) {
  return {
    date, nausea: 0, fatigue: 0, anxiety: 0, sleepOk: true,
    spotting: { reported: false, amount: null, dizzy: false },
    cramps: { reported: false, pain: null, oneSided: false, shoulder: false, dizzy: false },
    fever: false, fainted: false, fluidsDown: false, chest: false, calf: false, selfHarm: false,
    note: '', tier: -1, acknowledged: false, safetyOpened: false,
    savedAt: new Date().toISOString()
  };
}

function markMed(id, late = false) {
  const today = todayStr();
  if (!state.doses[today]) state.doses[today] = {};
  state.doses[today][id] = { taken: true, at: new Date().toISOString(), late };
  state.ui.focusDoneDate = today;
  save();
  toast(late ? 'Logged late. Never a double — you did the right thing by checking.' : 'Done. That\'s the day\'s main thing handled.');
  if (currentView === 'today') renderToday();
  else if (currentView === 'protocol') renderProtocol();
}

function unmarkMed(id) {
  const today = todayStr();
  if (state.doses[today] && state.doses[today][id]) {
    delete state.doses[today][id];
    save();
    toast('Undone. Update the row again whenever you need.');
    if (currentView === 'today') renderToday();
    else if (currentView === 'protocol') renderProtocol();
  }
}

function setWater(n) {
  const today = todayStr();
  if (!state.logs[today]) state.logs[today] = baseLog(today);
  const current = state.logs[today].water || 0;
  state.logs[today].water = current === n ? Math.max(0, n - 1) : n;
  save();
  renderToday();
}

function toggleAte(checked) {
  const today = todayStr();
  if (!state.logs[today]) state.logs[today] = baseLog(today);
  state.logs[today].ate = checked;
  save();
}

function saveCheckin() {
  if ($('#ciSpotting').checked && !$('input[name="spotAmount"]:checked')) {
    toast('One more tap: how much spotting? The amount changes the advice.');
    $('#spotPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if ($('#ciCramps').checked && !$('input[name="painLevel"]:checked')) {
    toast('One more tap: how bad is the cramping? The severity changes the advice.');
    $('#crampPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const data = readCheckin();
  state.logs[data.date] = data;
  save();
  renderCheckin();
  if (data.tier === 2) {
    toast('This fits the emergency list. The Safety panel is open.', true);
    openSafety(2);
  } else if (data.tier === 1) {
    toast('Noted. The clinic card is below.');
  } else {
    toast('Noted. Feeling quiet is allowed.');
  }
}

function quickClean() {
  const today = todayStr();
  const existing = state.logs[today];
  if (existing && existing.tier >= 1) {
    const ok = confirm('Replace today\'s flagged check-in with a quiet day? You logged something that gets a call or an ER visit. Is that right?');
    if (!ok) return;
  }
  const data = baseLog(today);
  data.tier = -1;
  state.logs[today] = data;
  save();
  renderCheckin();
  toast('Noted. Feeling quiet is allowed.');
}

function ackTier1() {
  const log = state.logs[todayStr()];
  if (log) { log.acknowledged = true; save(); }
  toast('Logged. Mention it at your next visit.');
  if (currentView === 'checkin') renderCheckin(); else renderToday();
}

function ackTier2() {
  const log = state.logs[todayStr()];
  if (log) { log.acknowledged = true; log.safetyOpened = true; save(); }
  toast('Marked handled. If anything worsens, go to the ER.');
  if (currentView === 'checkin') renderCheckin(); else renderToday();
}

function saveNotes() {
  const el = $('#protocolNotes');
  if (el) { state.profile.notes = el.value.trim(); save(); toast('Notes saved.'); }
}

function markOrdered(id) {
  const med = state.meds.find(m => m.id === id);
  if (!med) return;
  med.orderedAt = todayStr();
  if (med.supplyAsOf == null) med.supplyAsOf = todayStr();
  save();
  toast('Ordered. The countdown pauses until it arrives.');
  if (currentView === 'protocol') renderProtocol(); else renderToday();
}

function snoozeRefill(id) {
  if (!state.ui.refillSnooze) state.ui.refillSnooze = {};
  state.ui.refillSnooze[id] = todayStr();
  save();
  toast('Okay. Tomorrow, then.');
  renderToday();
}

function markApptDone(id) {
  const a = state.appointments.find(x => x.id === id);
  if (!a) return;
  a.status = 'done';
  save();
  toast('Marked done. One less thing on the calendar.');
  renderProtocol();
}

function saveWorry() {
  const enabled = $('#worryEnabled') ? $('#worryEnabled').checked : false;
  const time = $('#worryTime') ? $('#worryTime').value : '17:00';
  state.worryWindow = { enabled, time };
  save();
  toast(enabled ? `Worry window set for ${timeLabel(time)}. Outside it, worries wait.` : 'Worry window off. You can set it anytime.');
}

function copyUpdate() {
  const g = ga();
  const log = state.logs[todayStr()] || {};
  const appt = nextAppointment();
  const meds = state.meds.filter(m => m.active !== false);
  const taken = meds.filter(m => isTaken(m.id)).length;
  const medLine = meds.length ? `${taken} of ${meds.length} logged today` : 'none tracked';
  const notable = log.spotting?.reported ? 'spotting logged — clinic called' : log.cramps?.reported ? 'cramps logged' : 'nothing unusual';
  const text = `${state.profile.supportName || 'Hi'},\nToday at a glance: ${g ? g.label : 'post-transfer'}, due ${g ? fmtDate(g.edd) : 'TBD'}.\nMeds today: ${medLine}.\nAnything notable: ${notable}.\nNext: ${appt ? appt.label + ', ' + fmtDate(appt.date) : 'not scheduled yet'}.\nMood: anxiety ${log.anxiety ?? 0}/10 — your call is always welcome; no action needed.`;
  copyText(text);
}

function copyExport() {
  const box = $('#exportBox');
  if (box) copyText(box.value);
}

function restoreImport() {
  const box = $('#importBox');
  if (!box) return;
  let parsed;
  try { parsed = JSON.parse(box.value); } catch (e) { toast('That doesn\'t look like an export. Copy the whole JSON block — starting with { and ending with }.'); return; }
  if (!parsed || !parsed.profile || !parsed.version) { toast('That doesn\'t look like an export. It needs the profile and version fields.'); return; }
  if (!confirm('Restore this copy? It will replace everything currently on this device.')) return;
  state = normalize(parsed);
  state.profile.demo = false;
  state.profile.onboarded = true;
  save();
  closeModal();
  applyTheme();
  renderChrome();
  switchView('today');
  toast(`Restored — ${Object.keys(state.logs).length} check-in days back.`);
}

function resetData() {
  const box = $('#resetConfirm');
  if (!box || box.value.trim() !== 'RESET') { toast('Type RESET exactly, or keep your data.'); return; }
  if (!confirm('Gone means gone — there is no server holding a copy. Erase everything?')) return;
  try { localStorage.removeItem(KEY); } catch (e) {}
  state = freshState();
  closeModal();
  renderChrome();
  startOnboarding();
  toast('Erased. Starting fresh.');
}

function openSettings() {
  $$('dialog[open]').forEach(d => { if (d.id !== 'settingsModal') d.close(); });
  renderSettings();
  const modal = $('#settingsModal');
  if (!modal.open) modal.showModal();
}

function openSafety(tier = 2) {
  $$('dialog[open]').forEach(d => { if (d.id !== 'safetyModal') d.close(); });
  const log = state.logs[todayStr()];
  if (tier === 2 && log && log.tier === 2) {
    log.safetyOpened = true;
    save();
  }
  renderSafety(tier);
}

function openAppt(id) {
  const a = state.appointments.find(x => x.id === id);
  const spec = APPT_SPECS.find(s => s.id === id);
  if (!a || !spec) return;
  const body = $('#apptBody');
  const title = $('#apptTitle');
  if (title) title.textContent = a.label;
  const isScan = id === 'scan1';
  body.innerHTML = `
    <div class="row-between">
      <div><div class="eyebrow">${esc(spec.window)}</div><p class="small muted">${fmtDate(a.date, { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>
      <span class="pill ${apptStatus(a) === 'done' ? 'pill-primary' : 'pill-blue'}">${apptStatus(a) === 'done' ? 'Done' : apptDays(a) === 0 ? 'Today' : apptDays(a) > 0 ? 'In ' + apptDays(a) + ' days' : 'Recent'}</span>
    </div>
    <div class="stack-sm">
      <div><div class="eyebrow">What happens</div><p class="small">${esc(spec.what)}</p></div>
      <div><div class="eyebrow">What it can tell you</div><p class="small">${esc(spec.tells)}</p></div>
      <div><div class="eyebrow">What it can't tell you yet</div><p class="small">${esc(spec.cant)}</p></div>
      <div><div class="eyebrow">How to prepare</div><p class="small">${esc(spec.prep)}</p></div>
      <div><div class="eyebrow">After: a 2-minute decompression</div><p class="small">${esc(spec.after)}</p></div>
      ${isScan ? `<div class="callout callout-warn"><div>${I.info}</div><div><strong class="small">If this scan is indeterminate</strong><p class="small" style="margin-top:4px">Pick three rules once, today: a 15-minute daily worry window at a set time; one real distraction block per day; one human to text instead of Googling. Write the worst-case fear down once, read it once, done. A pre-decided plan beats "we'll figure it out if it's bad."</p><p class="tiny muted" style="margin-top:6px">What the follow-up will look for: a cardiac flicker, growth between the two scans (a healthy CRL grows about 1 mm/day), and a yolk sac that behaves. Seven to fourteen days is enormous measurable progress.</p></div></div>` : ''}
    </div>
    <div class="btn-row">
      ${apptStatus(a) !== 'done' ? `<button class="btn btn-primary" data-action="mark-appt-done" data-arg="${esc(a.id)}">Mark this visit done</button>` : ''}
      ${phoneButton('main')}
      <button class="btn" data-action="close-modal">Close</button>
    </div>`;
  const modal = $('#apptModal');
  if (!modal.open) modal.showModal();
}

/* ---------------- Theme, toast, clipboard ---------------- */
function applyTheme() {
  if (!state) return;
  const pref = state.settings.theme || 'light';
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#1B211D' : '#FAF7F2');
}

function toast(message, urgent = false) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = message;
  t.className = 'toast show' + (urgent ? ' urgent' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 4200);
}

function copyText(text) {
  const done = () => toast('Copied. Paste it anywhere — Notes, an email to yourself.');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('Copy didn\'t work here. Select the text and copy it manually.'); }
  document.body.removeChild(ta);
}

function closeModal() {
  $$('dialog[open]').forEach(d => d.close());
  if (currentView === 'today') renderToday();
  else if (currentView === 'protocol') renderProtocol();
}

function startOnboarding() {
  obStep = 1;
  obData = { transferDate: '', clinicName: '', clinicPhone: '', afterHoursPhone: '', meds: [] };
  const onboarding = $('#onboarding');
  if (onboarding) onboarding.hidden = false;
  renderOnboarding();
}

/* ---------------- Event wiring ---------------- */
function handleAction(action, arg) {
  switch (action) {
    case 'open-safety': openSafety(2); break;
    case 'close-modal': closeModal(); break;
    case 'open-settings': openSettings(); break;
    case 'goto-protocol': switchView('protocol'); break;
    case 'goto-today': switchView('today'); break;
    case 'goto-learn': closeModal(); switchView('learn'); break;
    case 'goto-checkin': switchView('checkin'); break;
    case 'goto-grounding': switchView('checkin'); setTimeout(() => { const g = $('#grounding'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); break;
    case 'goto-appt': switchView('protocol', false); openAppt(arg); break;
    case 'start-demo': startDemo(); break;
    case 'exit-demo': if (confirm('Leave demo mode? Nothing from the demo is saved.')) exitDemo(); break;
    case 'dismiss-reentry': state.ui.reentryDismissed = todayStr(); save(); renderToday(); break;
    case 'ack-tier1': ackTier1(); break;
    case 'ack-tier2': ackTier2(); break;
    case 'mark-med': markMed(arg); break;
    case 'unmark-med': unmarkMed(arg); break;
    case 'set-water': setWater(Number(arg)); break;
    case 'add-water': {
      const log = state.logs[todayStr()] || baseLog(todayStr());
      log.water = clamp((log.water || 0) + 1, 0, 8);
      state.logs[todayStr()] = log; save(); renderToday(); break;
    }
    case 'save-notes': saveNotes(); break;
    case 'mark-ordered': markOrdered(arg); break;
    case 'snooze-refill': snoozeRefill(arg); break;
    case 'mark-appt-done': markApptDone(arg); break;
    case 'open-missed': openMissed(arg); break;
    case 'missed-continue': missedContinue(); break;
    case 'take-late': markMed(arg, true); closeModal(); break;
    case 'copy-missed-note': copyMissedNote(arg); break;
    case 'save-journal': saveJournal(); break;
    case 'save-worry': saveWorry(); break;
    case 'start-breath': startBreathing(); break;
    case 'stop-breath': stopBreathing(); break;
    case 'select-week': selectedWeek = Number(arg); renderBaby(); break;
    case 'quick-clean': quickClean(); break;
    case 'copy-export': copyExport(); break;
    case 'restore-import': restoreImport(); break;
    case 'reset-data': resetData(); break;
    case 'copy-update': copyUpdate(); break;
    case 'add-med': addMed(); break;
    case 'remove-med': removeMed(arg); break;
    case 'print': window.print(); break;
    case 'toggle-site': {
      if (!state.ui.siteRotation) state.ui.siteRotation = {};
      state.ui.siteRotation[arg] = nextSite({ id: arg });
      save(); renderProtocol(); break;
    }
    case 'ob-next': obNext(); break;
    case 'ob-back': obBack(); break;
    case 'ob-finish': obFinish(); break;
    case 'ob-skip': {
      if (obStep === 1) { obData.transferDate = ''; }
      else if (obStep === 2) {
        const name = $('#obClinicName'), phone = $('#obClinicPhone'), after = $('#obAfterPhone');
        obData.clinicName = name ? name.value.trim() : '';
        obData.clinicPhone = phone ? phone.value.trim() : '';
        obData.afterHoursPhone = after ? after.value.trim() : '';
      } else { obData.meds = []; }
      obFinish(); break;
    }
    default: break;
  }
}

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-view]');
  if (tab && !e.target.closest('[data-action]')) {
    switchView(tab.dataset.view);
    return;
  }
  const el = e.target.closest('[data-action]');
  if (!el) return;
  if (el.tagName === 'INPUT') return;
  e.preventDefault();
  handleAction(el.dataset.action, el.dataset.arg);
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'ciSpotting') {
    const panel = $('#spotPanel'); if (panel) panel.hidden = !t.checked;
    if (t.checked) { const first = $('#spotPanel input[type=radio]'); if (first) first.focus(); }
  }
  if (t.id === 'ciCramps') {
    const panel = $('#crampPanel'); if (panel) panel.hidden = !t.checked;
    if (t.checked) { const first = $('#crampPanel input[type=radio]'); if (first) first.focus(); }
  }
  if (t.matches('[data-action="toggle-ate"]')) {
    toggleAte(t.checked);
    toast(t.checked ? 'Counted. Anything counts.' : 'Okay. Tomorrow is another day.');
  }
  if (t.id === 'worryEnabled') {
    state.worryWindow.enabled = t.checked;
    save();
  }
});

document.addEventListener('input', e => {
  if (e.target.type === 'range') {
    const out = $('#' + e.target.id + 'Out');
    if (out) out.textContent = e.target.value;
  }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'checkinForm') { e.preventDefault(); saveCheckin(); }
  if (e.target.id === 'settingsForm') { e.preventDefault(); saveSettings(e); }
});

document.addEventListener('keydown', e => {
  const tab = e.target.closest('[role="tab"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
    const list = tab.closest('[role="tablist"]');
    const tabs = $$('[role="tab"]', list);
    const i = tabs.indexOf(tab);
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    e.preventDefault();
    tabs[next].focus();
    switchView(tabs[next].dataset.view, false);
  }
});

$$('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) closeModal(); });
});

if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => { if (state && state.settings.theme === 'system') applyTheme(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state && !state.profile.demo) {
    state.meta.lastOpened = new Date().toISOString();
    save();
  }
});

/* ---------------- Init ---------------- */
function init() {
  state = loadState();
  if (state) {
    previousLastOpened = state.meta.lastOpened;
    state.meta.lastOpened = new Date().toISOString();
    if (state.profile.transferDate) ensureAppointments(false);
    if (!state.profile.demo) save();
    $('#onboarding').hidden = true;
  } else {
    state = freshState();
    startOnboarding();
  }
  applyTheme();
  renderChrome();
  switchView('today', false);
  if (!storageOK) showStorageBanner();
  if (state.profile.demo) {
    const b = $('#demoBanner');
    if (b) b.hidden = false;
  }
  if (!state.profile.transferDate) {
    // Keep the dashboard usable; the context card invites setup.
  }
}

document.addEventListener('DOMContentLoaded', init);
