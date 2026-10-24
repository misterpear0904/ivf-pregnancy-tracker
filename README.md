# After the Transfer

### A calm, clinically grounded dashboard for the first trimester after IVF

This project turns early post-IVF pregnancy care into something you can actually use at 7 a.m. and 2 a.m.: one clear next action, an honest medication tracker, a symptom check-in that knows when to send you to the clinic or the ER, and a week-by-week corner for your boy.

It was built for a singleton pregnancy after a **day-5 blastocyst transfer**, with a **male (XY) result**, in **weeks 4–22** — with the heaviest detail in weeks 4–13.

> **This is education, not medical advice.** Your clinic's instructions always outrank anything here. Nothing should be started, stopped, or changed without your RE or OB. If something feels wrong, call your clinic; if it is an emergency, call 911 or go to the ER.

---

## Start here (60 seconds)

1. **Open the dashboard:** [`DASHBOARD.md`](DASHBOARD.md) — the full calm command center.
2. **Set three things:** your transfer date, your clinic phone, and your medication schedule. There is a fill-in table at the top of the dashboard and a guided setup in the app.
3. **Use one card a day.** You do not need to read all of this. The dashboard is designed so the next right action is always the first thing you see.

**Want tap-to-save, reminders, and the interactive check-in?** Open [`app/index.html`](app/index.html) in any browser. It is one self-contained file, works offline, and stores everything on your device only.

---

## What is in this project

| File | What it is | When to use it |
|---|---|---|
| **[DASHBOARD.md](DASHBOARD.md)** | The main dashboard: Today, Protocol, Symptom & Anxiety, Boy Development, FAQs | Daily |
| **[CHECKLIST.md](CHECKLIST.md)** | Printable/tappable checklists for meds, appointments, food safety, red flags, and questions | Mornings, appointments, printing |
| **[FLOW.md](FLOW.md)** | The chronological flow from transfer day to the 20-week anatomy scan, including decision trees for scary moments | When you want to know "what happens next?" |
| **[app/index.html](app/index.html)** | The interactive app: onboarding, med checkoffs, severity-aware check-in, trends, journal, grounding, export/import, dark mode | Daily, especially on a phone |
| **[research/01-clinical-protocol.md](research/01-clinical-protocol.md)** | The evidence and source-of-truth clinical protocol, with citations | When you want the "why" |
| **[research/02-ux-blueprint.md](research/02-ux-blueprint.md)** | The UX architecture, wireframes, data model, and interaction logic | Design/review |
| **[research/02b-copy-deck.md](research/02b-copy-deck.md)** | The final patient-facing copy deck | Editing the app or dashboard |
| **[research/03-qa-report.md](research/03-qa-report.md)** | The spec-stage end-user QA simulation, defect log, and fixes | Review/QA |
| **[research/03b-final-qa.md](research/03b-final-qa.md)** | The built-product final gate, fix verification, and residual clinical risks | Review/QA |
| **[BUILD-REPORT.md](BUILD-REPORT.md)** | Orchestration, model routing, test evidence, and release status | Review/handoff |
| **[research/screenshots/](research/screenshots)** | Mobile, dark-mode, 320px, safety, appointment, and re-entry screenshots | Visual review |

---

## The four zones

### 1. Daily Command Center
One next action. Medications due now. Water. A 30-second check-in. A calm line that names a mechanism instead of saying "don't worry."

### 2. IVF Medical Protocol Tracker
PIO and vaginal progesterone, estrogen, aspirin, prenatals. Refill buffers. Injection-site rotation. Taper windows. Every appointment from beta #1 to the anatomy scan — with what it can and cannot tell you.

### 3. Symptom & Anxiety Log
A severity-aware check-in. Light spotting gets a same-day clinic call. Heavy bleeding, one-sided pain, shoulder-tip pain, or fainting opens the emergency panel immediately. Anxiety is tracked as a symptom, not a failure. Includes a worry journal, a 15-minute worry window, box breathing, and 5-4-3-2-1 grounding. The app's **Safety** tab is always one tap away.

### 4. Boy Development Weekly Flow
Weeks 5–22, with accurate size/length milestones and boy-specific notes: SRY activation around weeks 6–7, the testosterone ramp around weeks 8–12, genital differentiation, and the 18–22-week anatomy scan that confirms what NIPT predicted.

---

## The safety model (read this once)

**Tier 2 — go now / call 911 or go to the ER**
- Heavy bleeding: soaking a pad in an hour or less, clots, or gray/white tissue
- Severe pain, one-sided pain, or pain with a shoulder-tip ache
- Fainting or near-fainting
- Fever of 100.4°F / 38°C or higher with any other symptom
- Can't keep fluids down for 24 hours, or can't pee normally
- Chest pain, trouble breathing at rest, or coughing blood
- Thoughts of harming yourself or the pregnancy → call or text 988, your OB, or go to the ER

**Tier 1 — call your clinic today**
- Any spotting or bleeding, even light or brown
- New or different cramping; moderate pain
- Foul-smelling discharge
- A fever that stays up for 24 hours
- Food won't stay down, but fluids will
- A calf that is suddenly warm, swollen, or painful on one side
- Anxiety you can't work, eat, or sleep through; intrusive thoughts

**Uncertainty always counts as a reason to call.** You will not be "the dramatic one."

---

## Personalize it

The dashboard uses blanks you fill in once:

| Field | Where to find it | Why it matters |
|---|---|---|
| Transfer date | Your RE's transfer summary | Sets gestational age and EDD (`transfer + 261 days` for a day-5 blast) |
| Clinic main line | Your clinic's portal or welcome packet | The call button on every safety card |
| After-hours line | Your clinic's voicemail or portal | The 2 a.m. path |
| Graduation week | Ask your RE: "What week do I graduate, and what gets sent to the OB?" | Prevents the 9-week "where did my clinic go?" feeling |
| Medication doses and stop weeks | Your RE's written protocol | The app follows your protocol; it does not prescribe one |

In the app, open **Settings** to change any of these. Changing your transfer date recalculates every screen.

---

## A note on the boy-specific content

NIPT reads Y-chromosome DNA from the placenta. With an adequate fetal fraction, a "male" result is about **98–99% accurate** — excellent, but still a screen. A first-trimester ultrasound cannot reliably distinguish genitalia, and a "12-week nub" guess is not a method. The **18–22-week anatomy scan** is the visual confirmation and the full structural check.

At the anatomy scan, two boy-specific findings can sound alarming and are normal:
- **Testes inside the abdomen** at 18–22 weeks — they descend in the third trimester, sometimes after birth.
- **A small hydrocele** (fluid around the scrotum) — usually resolves on its own.

---

## Privacy

The app has no accounts, no analytics, no network calls, and no server. Everything is stored in your browser's `localStorage` on your device. You can export a JSON copy from Settings and restore it later. If you open the file from a phone's Files app, saved data can occasionally vanish on some devices — a weekly export to Notes is cheap insurance.

---

## Clinical review status

The clinical content is compiled from public guidance by ACOG, ASRM, SMFM, CDC, FDA, NIH/MedlinePlus, NICE, WHO, and the March of Dimes, with sources listed in the clinical protocol. **It has not been reviewed by your RE or OB.** The triage thresholds, the >24-hour hormonal-gap wording, and the boy-specific second-trimester wording should be confirmed with your clinician before you rely on them. Your clinic's plan always wins.

---

*Built with a calm aesthetic, an anxiety-first content policy, and a hard rule: never reassure falsely, never alarm without a next step.*
