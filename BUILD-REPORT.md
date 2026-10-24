# Build Report — After the Transfer

**Project:** Post-IVF Pregnancy Dashboard, Checklist & Flow
**Patient context:** singleton pregnancy after a day-5 blastocyst transfer · male (XY) result · early first trimester
**Date:** October 23, 2026
**Status:** **SHIP** (content validated against public guidance; clinician sign-off still required — see [Residual risks](#residual-risks))

> **Education, not medical advice.** Your clinic's instructions always outrank anything here. Nothing should be started, stopped, or changed without your RE or OB. In an emergency, call 911 or go to the ER.

---

## What was delivered

| Deliverable | File | What it is |
|---|---|---|
| **Main dashboard** | [`DASHBOARD.md`](DASHBOARD.md) | Four zones — Today, Protocol, Symptom & Anxiety, Boy Development — plus safety strip, triage tables, FAQs, and print handout |
| **Interactive checklist** | [`CHECKLIST.md`](CHECKLIST.md) | Daily six, medication and injection log, weekly checklists, appointment prep, red flags, food safety, anxiety toolkit, questions, partner list, "if this happens" flows |
| **Chronological flow** | [`FLOW.md`](FLOW.md) | Transfer day → beta → first scan → graduation → NIPT → NT → anatomy, with decision trees and emotional-weather guidance |
| **Interactive app** | [`app/index.html`](app/index.html) | Single-file, offline, no-dependency app: onboarding, med checkoffs, severity-aware check-in, trends, journal, grounding, appointments, dark mode, export/import, print |
| **Orientation** | [`README.md`](README.md) | Where to start, what each file is for, safety model, personalization, privacy |
| **Clinical source** | [`research/01-clinical-protocol.md`](research/01-clinical-protocol.md) | Evidence-based protocol and verified sources |
| **UX blueprint** | [`research/02-ux-blueprint.md`](research/02-ux-blueprint.md) | Information architecture, wireframes, design tokens, data model, interaction logic |
| **Copy deck** | [`research/02b-copy-deck.md`](research/02b-copy-deck.md) | Final patient-facing strings |
| **QA reports** | [`research/03-qa-report.md`](research/03-qa-report.md) · [`research/03b-final-qa.md`](research/03b-final-qa.md) | Spec-stage and built-product QA, defect logs, fixes |
| **Screenshots** | [`research/screenshots/`](research/screenshots) | Mobile, dark, 320px, safety, appointment, re-entry evidence |

---

## How it was built

### Team and model routing

| Role | Subagent | Model used | Result |
|---|---|---|---|
| Medical & clinical research | **Alpha** | `opencode-go/glm-5.3-flash` (primary) | 5,800-word clinical protocol, verified sources, 12 facts for the dashboard |
| UX/UI architecture and copy | **Beta** | `opencode-go/glm-5.3-flash` (primary) | Blueprint v1.1 + final copy deck after QA revision |
| End-user QA | **Gamma** | `opencode-go/glm-5.3-flash` (primary) | Two gates: spec-stage `SHIP WITH FIXES`, built-product `SHIP` after fixes |
| Orchestration and implementation | Master agent | `opencode-go/deepseek-v4.1-flash` | Assembly, app build, browser tests, final QA loop |

**Fallback chain:** GLM-5.3-Flash → DeepSeek V4.1 Flash → Beam Free. **No rate-limit, quota, or context errors occurred during this build, so the fallbacks were not triggered.** Quota was monitored before and after:

| Window | Start | End |
|---|---:|---:|
| 5-hour | 0.2% | 3.8% |
| Week | 23% | 24% |
| Month | 12% | 13% |

Approximate build spend attributable to this work: **well under $1** (GLM-5.3-Flash usage rose from 4.3% to 5.1% of its weekly cap; total month cost $1.54 for GLM).

### Iterations

1. **Alpha** compiled the clinical protocol with ACOG/ASRM/SMFM/CDC/FDA/NIH/NICE/WHO sources, explicit clinic-variation ranges, a two-tier red-flag model, and boy-specific milestones.
2. **Beta** mapped the four zones, design system, data model, and interaction rules. The first blueprint was intentionally reviewed before implementation.
3. **Gamma (spec gate)** simulated 12 scenarios as an anxious patient with a prior loss. It found two P0s: the check-in was severity-blind (severe one-sided pain could render as Tier 1), and heavy bleeding could reuse the light-spotting card. Verdict: **SHIP WITH FIXES**.
4. **Beta (revision)** rebuilt the check-in around a data-driven tier table, defined med windows and post-checkoff behavior, added re-entry, waiting-window, NIPT no-call, graduation handoff, print, and dark mode.
5. **Implementation:** built the single-file app from `app/src/` with a Node build script, then ran a headless Chrome pass.
6. **Gamma (built-product gate)** re-read the actual code and found a stale build (Learn/FAQ unreachable), un-loggable stand-alone fainting, and a destructive "quiet day" button, plus P2s. All were fixed.
7. **Gamma (fix verification)** confirmed F-01–F-08 PASS and issued **SHIP**.

### QA scores

| Dimension | Spec-stage | Final gate |
|---|---:|---:|
| Clinical safety | 3 | 4 |
| Anxiety reduction | 4.5 | 5 |
| Clarity | 4.5 | 5 |
| Navigation | 4 | 4 |
| Accessibility | 4 | 4 |
| Content completeness | 3 | 5 |
| Logic | 3.5 | 4 |
| Delight | 4 | 4 |

Final gate: **SHIP**. The remaining caveats are clinician validation, not code defects.

---

## Test evidence

A headless Chrome harness (`scripts/smoke-test.mjs`) drove the real built file at **390px and 320px**, light and dark, with **zero console errors** and **all checks passing**:

- Onboarding: welcome, transfer-date step, clinic step, med step, skip, demo, real-profile finish.
- Demo mode: banner, non-persistence, exit.
- Today: GA/EDD context, one-focus card, med checkoff, "rest of today is optional" behavior.
- Protocol: what's next, med cards, appointment timeline, appointment detail modal.
- Check-in: severity panel, heavy spotting → Safety modal with 911 first, stand-alone fainting → Safety modal.
- Missed-dose flow: PIO routes to clinic; copy-for-call; never double.
- Settings: transfer field, dark mode, clinic phone, save.
- Safety: clinic `tel:` link, 911, 988, after-hours.
- Little One: week cards, boy notes, week-12 "sex is not readable on ultrasound" caveat.
- Learn/FAQ reachable from sidebar, Protocol, and Settings.
- Print block contains the Tier-2/Tier-1 card and `[VERIFY LOCALLY]`.
- Re-entry after a 3-day gap: "Welcome back", last-dose truth, no guilt.
- 320px: no horizontal overflow.
- EDD math: transfer **2026-10-10** → EDD **2027-06-28**; **4w4d** on **2026-10-23**.
- Markdown: every relative link and anchor resolves (`scripts/check-links.mjs`).

### Rebuild and re-test

```bash
node --check app/src/app.js
node scripts/build-app.mjs          # inlines CSS + JS into app/index.html
node scripts/check-links.mjs        # verifies Markdown links/anchors
node scripts/smoke-test.mjs         # launches headless Chrome; writes screenshots
```

---

## Design and safety decisions worth knowing

- **One action at a time.** The Today screen ranks a single next action, with strict precedence for re-entry, Tier-2, Tier-1, refills, graduation, medications, appointments, check-in, and water. After a med checkoff, the app deliberately stops promoting chores for the rest of the day.
- **The tier is computed from data, not prose.** Spotting amount, dizziness, pain severity, one-sidedness, shoulder-tip pain, fainting, fever, chest symptoms, fluids, and self-harm each change the route. Tier-2 opens the Safety panel with 911/ER first.
- **No false reassurance.** The copy avoids "don't worry" and "everything is fine." Reassurance always names a mechanism or a next action.
- **Medication honesty.** The app never tells a patient to double a dose or stop a hormone cold turkey. A missed PIO dose always routes to the clinic, with a preview of the two likely answers and a copyable call script.
- **Boy-specific accuracy.** SRY activation ~weeks 6–7, testosterone ramp ~8–12, genital differentiation, NIPT male accuracy ~98–99%, and the 18–22-week anatomy scan as visual confirmation. Week 12 explicitly says ultrasound cannot read sex yet.
- **Pelvic rest nuance.** The app and docs note that prescribed vaginal progesterone should not be stopped because of pelvic rest; ask the RE how to give it.
- **Privacy.** No accounts, analytics, network calls, or server. `localStorage` only, with export/import and a file:// caveat.

---

## Residual risks

These are **not** code defects. They require clinician review before a real patient relies on the app:

1. **The full tier mapping** — especially stand-alone fainting → auto-Tier-2, fever + calf → Tier 2, and fever alone → call-today.
2. **The >24-hour hormonal-gap wording** ("call before restarting") and the PIO preview ("skip-and-resume or take late").
3. **Boy-specific second-trimester wording** — intra-abdominal testes and hydrocele are normal findings at the anatomy scan; an OB should read the exact phrasing.
4. **988/911 placement and wording** for pregnancy-stage mental-health crises.
5. **Beta hCG rise figures** (53% / 49% / 40% / 33%) as rendered in FAQ 5 and the Beta #2 appointment detail.
6. **Real-device iOS pass** — `tel:`/`sms:`/clipboard under `file://`, VoiceOver sweep of Today → Safety → Check-in, and reduced-motion behavior.

The clinical content has **not** been reviewed by the patient's RE or OB. That review is the final gate before real-world use.

---

## File tree

```
ivf-pregnancy-tracker-gemini/
├── README.md
├── DASHBOARD.md
├── CHECKLIST.md
├── FLOW.md
├── BUILD-REPORT.md
├── app/
│   ├── index.html          ← open this in a browser
│   └── src/
│       ├── index.html
│       ├── styles.css
│       └── app.js
├── scripts/
│   ├── build-app.mjs
│   ├── smoke-test.mjs
│   └── check-links.mjs
└── research/
    ├── 01-clinical-protocol.md
    ├── 02-ux-blueprint.md
    ├── 02b-copy-deck.md
    ├── 03-qa-report.md
    ├── 03b-final-qa.md
    └── screenshots/
```

---

## Final word

The goal was not to make the first trimester feel safe by pretending the stakes are low. It was to make the next step obvious, the red flags impossible to miss, and the waiting a little less lonely.

**SHIP** — with the clinician-validation caveats above.
