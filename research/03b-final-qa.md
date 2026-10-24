# 03b — Final QA Gate (built product)
**Subagent GAMMA · Oct 23, 2026 · Audits the *built* deliverables: `app/index.html`, `app/src/app.js`, `app/src/styles.css`, DASHBOARD/CHECKLIST/FLOW/README, clinical doc v1.0, screenshots.** Prior findings in `03-qa-report.md` (spec-stage). This pass re-verifies against working code.

---

## Verdict: **SHIP WITH FIXES**

The P0 pair from 03 (severity-blind check-in, dead-end copy) is genuinely fixed: `computeTier()` implements the decision table faithfully, Tier-2 answers open the Safety modal on save, and there is no Tier-2-to-Tier-1 routing bug. Two things still block a clean stamp: the **shipped `index.html` carries a stale inline script** (core Learn/FAQ content is unreachable in the file a patient actually opens), and **stand-alone fainting is un-loggable**, which is a real Tier-2 routing hole, not a nitpick.

---

## Scorecard

| Dimension | 1–5 | One line |
|---|---|---|
| Clinical safety | 4 | `computeTier` matches the decision table line-for-line; fainting-alone and fever+calfer routes leak to Tier 1/quiet |
| Anxiety | 5 | No banned reassurance anywhere; "Late night, I see." + late-use guard strip; re-entry card is honest and guilt-free |
| Clarity | 5 | One focus card, verbs not verdicts, every tier card ends in a call option |
| Navigation | 4 | Safety ≤1 tap everywhere; Learn tab orphaned in the built file (see F-01) |
| Accessibility | 4 | Skip link, native tabs, sr-only labels, reduced-motion, good dark urgent-contrast; three target sizes under 44px |
| Content | 5 | EDD math re-verified (transfer 2026-10-10 → EDD 2027-06-28; 4w4d on 2026-10-23); beta rises, scan thresholds, pelvic-rest/vaginal-progesterone nuance all carried |
| Logic | 4 | Missed-dose branches, refill countdown, import/export, demo non-persistence all sound; one destructive `quickClean` |
| Delight | 4 | Week-12 "no nub guess" line, "testosterone ramping — a quiet one", dismissal-first celebrations |

---

## Defect log

### F-01 · **P1** — The shipped `app/index.html` script is stale; the Learn/FAQ view is unreachable
- **Where:** `app/index.html` inline `<script>` (whole file vs `app/src/app.js`; confirmed by fc.exe diff — 8 divergent lines).
- **Issue:** The build predates the last source pass. `index.html` is missing three things present in `app.js`: (a) the "Learn / FAQ" link in the Protocol "Questions to bring" card, (b) the Settings "Learn / FAQ" block, (c) `case 'goto-learn':` in `handleAction`. The bottom nav has only Today/Protocol/Check-in/Little One + Safety, and the sidebar likewise. **In the delivered single file the 12 FAQs — including spotting, progesterone stop, NIPT no-call, pelvic rest, food safety, 2 a.m. anxiety — cannot be opened at all.**
- **Evidence:** `Select-String goto-learn` on `app/index.html` = 0 matches; on `src/app.js` = 3.
- **Fix:** Rebuild `index.html` from the current `src/app.js` (and verify `src/styles.css` vs the inline `<style>` the same way). Add a sync check (`node -e` compare or build step) to CHECKLIST so this can't regress.

### F-02 · **P1** — Fainting/near-fainting alone cannot be logged as Tier 2
- **Where:** `computeTier()` (`app/src/app.js` L928–944); check-in form `renderCheckin()` L798–859.
- **Issue:** "Fainting or near-fainting" is a stand-alone Tier-2 item in DASHBOARD.md L419, CHECKLIST.md L230, and the Safety panel. In the app, the dizzy/faint checkboxes exist **only inside the spotting and cramps panels**, which appear only when she also toggles spotting or cramps. Aidious fainting with no bleeding and no logged pain has no input; a check-in with sliders-only saves tier −1 ("Feeling quiet is allowed") to a patient who blacked out.
- **Fix:** Move a "Dizzy, lightheaded, or fainted?" switch out of the two panels (or add a distinct ☐ "I fainted / nearly fainted" beside "Anything else"); in `computeTier()`, any faint → `return 2`.

### F-03 · **P1** — "Quiet day — log nothing else" silently erases an unacknowledged Tier-2 log
- **Where:** `quickClean()` (`app.js` L1783–1791); button in `renderCheckin()` L869.
- **Issue:** `quickClean` unconditionally replaces `state.logs[today]` with a fresh baseLog. If she logged heavy spotting (Tier 2, hasn't acknowledged), then taps the friendly "Quiet day" button, the urgent flag, the Today focus card's "Open Safety now" card, and the check-in pill ("Urgent") all vanish, replaced by "Noted. Feeling quiet is allowed." One mislabeled tap on the very button positioned next to "Save check-in" downgrades an emergency.
- **Fix:** In `quickClean`, if the existing log's `tier >= 1`, `confirm("Replace today's flagged check-in with a quiet day? You logged something that gets a call/ER visit — is that right?")` before overwrite; on cancel, keep the log.

### F-04 · **P2** — Fever's "with any other symptom" is implemented as "with spotting or cramps"
- **Where:** `computeTier()` L930–931.
- **Issue:** "Fever ≥100.4 with any other symptom" is Tier 2 in the Safety panel, DASHBOARD, and CHECKLIST. In code, `otherSymptom` is only `spotting.reported || cramps.reported`. Fever + calf (a plausible infected-line/DVT mix), fever alone ≥24h, and fever + "can't pee" combinations route Tier 1. Direction is conservative (never hides Tier 2), and the clinical doc's own fever wording (L233: "escalate to the clinic at minimum; with chills/foul discharge/bleeding is Tier 2") is slightly looser — but the check-in's own sub-copy ("With any other symptom, this is urgent") overpromises what the code counts.
- **Fix:** Count `log.calf || log.chest || log.fluidsDown` (chest/fluids already Tier 2 via line 929) plus a general severity question is overkill; simplest honest fix: change the sub-copy to "This alone gets a call today; with spotting or cramping it's ER-now", or treat fever ≥100.4 as Tier 2 outright pending clinician sign-off.

### F-05 · **P2** — Sub-44px touch targets
- **Where:** `styles.css` L281 (`.med-check` 34px), L300 (`.water-dot` 38px, 34px at ≤360px), L232 (`.link-btn` min-height 32px).
- **Issue:** These are the tap targets for a checking-a-dose-with-cold-hands-on-a-bus action. The med checkbox is the single most-run control and it's 20pt short of the guideline.
- **Fix:** Enlarge `.med-check` to 44px, `.water-dot` to 44px (shrink row gap), and `.link-btn` to 44px compact (or 32px visual with an extended hit area via padding + negative margin).

### F-06 · **P2** — Demo mode can produce a fake "Saved" and un-cancellable edits
- **Where:** `saveSettings()` L1510–1527; `addMed`/`removeMed` L1529–1545; `markApptDone` in demo.
- **Issue:** In demo, "Save changes" toasts *"Saved. The dashboard follows your protocol."* while `save()` silently no-ops — contradicts the demo banner ("nothing here saves"). Also `addMed`/`removeMed` call `collectSettings()+save()`, so after adding a med, the **Cancel** button can't undo the addition (state already mutated and, in a real profile, persisted).
- **Fix:** In demo, toast "This is a demo — nothing saves"; for a real profile, make `addMed` stage a working row and commit only on Save, or set the toast on Cancel to note that the med list changes were already kept.

### F-07 · **P2** — Print output drops the markers and the safety content
- **Where:** `styles.css` `@media print` L514 (`dialog, .modal { display:none }`) + all `[VERIFY LOCALLY]` instances (`app.js` L1287, L1308, L1452) living inside modals.
- **Issue:** The printable Medication-interaction caveat and the Safety tier cards only exist in hidden dialogs, so "Keep the [VERIFY LOCALLY] markers" (DASHBOARD bottom) fails for the app's own print path; printing the Check-in view also loses the red-flag card buttons (acceptable) but the [VERIFY LOCALLY] rule was explicit.
- **Fix:** Add a `.print-only` block (the class already exists) containing the two-tier red-flag list with 911/988 and the VERIFY LOCALLY interaction sentence, rendered once on the Check-in and Protocol views.

### F-08 · **P2** — Expansion-correct minor: same-day onboarding masks a genuinely missed dose only on day one; no back-fill policy
- **Where:** `medRow()` L562–564 (`addedToday` exemption), `computeFocus` re-entry card.
- **Issue:** Correct behavior to soften onboarding day — verified the 10 p.m. onboarding case shows "Added today · 8:00 pm", not a red "Missed" — but on any later day at 10 p.m. the row reads red **"Missed"** with no expandable next step visible until tap (it does open the missed flow, good). Also on re-entry after 3+ days the app never back-fills missed doses for days she was gone — intentional and forgivable, but the re-entry card only cites the *last recorded* dose; it never offers "Mark the intervening days skipped" so the record silently says nothing about 3 unlogged nights of PIO.
- **Fix:** Change the missed-state text to "Missed — tap for what to do", and in the re-entry card add one line: "Days you didn't open the app aren't logged as missed — mention the gap when you call."

---

## What already works

- **The severity-aware triage is real.** Spotting amount (wipe/light/pad-soak/clots), pain severity/one-sided/shoulder-tip, and dizzy each change the tier; Tier 2 pops the Safety modal on save with 911-first button order; there is **no** combination that mis-routes a listed Tier-2 input to Tier 1 (except F-02/F-04 edge inputs).
- **Every phone path has an end state.** No number saved → "Add clinic number" button; 911 and 988 are always live `tel:`/`sms:` anchors; the double-dose branch keeps 911; missed-PIO offers the call script copy.
- **EDD/GA math is exact.** +261 days verified for the shipped example pair, DASHBOARD's "transfer day = 2w5d" is consistent with `19 + dpt`, and the FLOW phase windows (day 23 = 6w0d, day 51 = 10w0d, day 121 = 20w0d) all reconcile.
- **Anxiety discipline held under grep.** Zero "not a worry/don't worry/relax/momma/rainbow" strings in shipped copy; the late-night guard ("Nothing here needs urgent attention…"), "Late night, I see.", and the loss-history variant are the quiet wins.
- **The 2 a.m. ragged edge is handled:** Safety one tap from bottom nav and sidebar, dark-mode `--urgent` contrast is strong (verified in screenshot 07), box breathing stops cleanly, and the storage-failure banner tells her to export rather than implying loss.

---

## Final pre-ship checklist

1. [x] **PASS** — Decision table ↔ `computeTier()` line-by-line match (spotting ×4 rows, cramping ×6 rows).
2. [ ] **FAIL** — Rebuild `index.html` from source so Learn/FAQ is reachable (F-01).
3. [ ] **FAIL** — Stand-alone fainting input → Tier 2 (F-02); confirm() before `quickClean` overwrites a Tier ≥1 log (F-03).
4. [x] **PASS** — Onboarding skip/back/finish, demo enter/exit+reload, missed-dose all four gaps × PIO/hormonal/aspirin, double-dose, Settings add/remove/save, appointment modal, export/import roundtrip, typed-RESET, dark mode, 320px, no console errors (prior browser pass + this code read).
5. [ ] **UNTESTED** — Real-device iOS: `tel:`/`sms:`/`clipboard` under `file://`, VoiceOver sweep of Today→Safety→Check-in.
6. [x] **PASS** — Copy audit: no banned strings; no alarming phrase without a next action.
7. [x] **PASS** — Markdown: all DASHBOARD anchors resolve (#safety/#today/#triage/#missed-dose/#waiting-plan/#my-protocol); tables well-formed; checklist boxes GitHub-renderable.
8. [ ] **PASS w/ caveat** — Privacy: no network calls, demo never persists, localStorage-failure banner exists; file:// caveat stated in Settings itself.
9. [ ] **FAIL** — Print keeps [VERIFY LOCALLY] + red-flag card (F-07).
10. [ ] **UNTESTED** — F-04 fever wording sign-off.
11. [x] **PASS** — Reduced motion, color-never-alone, tl/tier states all text-labeled.
12. [ ] **FAIL** — Touch targets 44px on med-check / water-dot / link-btn (F-05).

---

## Must be clinician-validated before a real patient uses it

1. The full rendered Tier mapping — especially the fever-with-symptom edge (F-04) and whether fainting-alone-auto-ER is the intended instruction.
2. The >24h hormonal-gap wording ("call before restarting") and the PIO preview text ("skip-and-resume OR take late"). Both are flagged and remain unchanged since 03.
3. Boy-specific second-trimester wording (intra-abdominal testes, hydrocele) — present verbatim in week 18/20 cards and FAQ 8; needs an OB read.
4. 988 placement/wording for pregnancy-stage crises.
5. Beta rise figures (53/49/40/33%) as rendered in FAQ 5 and the Beta #2 appointment detail.

*End of 03b. Gate reopens for F-01 through F-03 only.*
