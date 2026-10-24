# Post-IVF Pregnancy Dashboard — UX/UI Blueprint & Copy Deck (v1.1)
**Subagent BETA (UX/UI Dashboard & Flow Architect) · Oct 23, 2026 · v1.1 — post-Gamma QA revision**
Companions: `01-clinical-protocol.md` (clinical source of truth v1.0) and `03-qa-report.md` (Gamma audit). **Copy lives in `02b-copy-deck.md`** — this document specifies structure, logic, tokens; the deck holds final verbatim strings.

> ⚠️ Standing rule inherited from the clinical doc: education, not medical advice. Every threshold, med rule, and tier split traces to that document. `[VERIFY LOCALLY]` markers from the source must survive into the final HTML **and the print output**.

---

## 0. Revision log (QA gate D-01 → D-20)

| ID | Sev | Status | Resolution |
|---|---|---|---|
| D-01 | P0 | **Fixed** | Check-in spotting/cramps rows now open a 1-screen conditional severity follow-up (amount, pain, sidedness, shoulder-tip, dizziness). Tier decision is made by data per the decision table in §9.2 — never by her reading prose. `severity, oneSided, shoulderTip, heavyBleed, fainted, fever, fluidsDown` added to log schema. |
| D-02 | P0 | **Fixed** | Inline cards are tier-gated: any Tier-2 input (heavy bleed/clots/tissue, severe or one-sided pain, shoulder-tip, fainted, or Tier-2 multiplier) opens the **Safety modal scrolled to Tier 2**, 911/ER first, clinic second. Light spotting/mild cramps keep the excellent Tier-1 inline card verbatim. Full decision table: §9.2. |
| D-03 | P1 | **Fixed** | Med focus window defined in §9.3: surface nothing before (scheduled − 60 min); from −60 min to +2 h show "take now"; at +2 h the item leaves focus and the missed-dose flow (rank #2) takes over. Never nags 13 h early. |
| D-04 | P1 | **Fixed** | Post-"Mark done": calm one-line confirmation toast, **no promotion of another chore** — focus card returns to the calm state ("That's the day's main thing done. Anything else is optional."), context band stays. Next-dose line updates to next scheduled time. The rewarded behavior is *stopping*. |
| D-05 | P1 | **Fixed** | Missed-dose Branch A (PIO) keeps [Call clinic] as the CTA but adds a `<details>` *before* the call previewing the two likely clinic answers (skip-and-resume OR take it late) per doc L69. Never self-executes either option. |
| D-06 | P1 | **Fixed** | Branch B reconciled to doc L67–L70: same-day late take is acceptable (take as soon as remembered, that day); never a double dose; any progesterone/estrogen gap >24 h → call before restarting; PIO missed at all → call. |
| D-07 | P1 | **Fixed** | Nav simplified: 4 tabs + one pinned Safety pill. Header phone/settings removed. Settings reachable from a header text link (≥44px) on Today and as the last item of the tab-row's accessible order; Learn reachable from Settings **and** via links inside Protocol/Check-in cards. 320 pt layout verified as a layout rule (§3). |
| D-08 | P1 | **Fixed** | Re-entry states defined (§9.5): 1-day, 2-day, ≥2-day, ≥7-day gaps. One soft card: last recorded dose truth + refill status + "nothing to back-fill." No streak anywhere in re-entry; wording is **"days you checked in"**, never "streak." Streaks never computed in demo, re-entry, or anxiety ≥8. |
| D-09 | P2 | **Fixed** | "Routine, not a worry" removed everywhere. Replacement carries the true mechanism: "Conservative thresholds exist so a healthy pregnancy is never accidentally declared failed — that's why they follow, not declare." |
| D-10 | P2 | **Fixed** | FAQ set re-toned for emotional peaks: graduation-handoff FAQ and scanxiety/waiting FAQ added (12 FAQs total, copy in deck §7). |
| D-11 | P2 | **Fixed** | Markdown med table fixed with pipe-header row; anchor-link behavior tested-note added (§10). |
| D-12 | P2 | **Fixed** | Garbled focus template 5 replaced: "Call the clinic today: {reason}. Use the after-hours line if it's outside clinic hours." FAQ caffeine title fixed. Zero garbled strings remain — deck audited line-by-line. |
| D-13 | P2 | **Fixed** | NIPT no-call / low fetal fraction FAQ added (~1–5% redraw, most redraws succeed, ask clinic next step). |
| D-14 | P2 | **Fixed** | 3-item repeat-scan waiting plan added to every indeterminate-scan post-visit state (§5 appointment cards + deck): worry window, one distraction block, one scan partner to text. Plus "what the follow-up will look for." |
| D-15 | P2 | **Fixed** | Full week-card copy for weeks 5–22 written in the deck (§6). Week-12 card states explicitly: sex is not readable on ultrasound this week; NIPT is the source; anatomy scan 18–22 w confirms. Boy milestones audited against doc §6. Loss-history gentle variant noted per week where relevant. |
| D-16 | P2 | **Fixed** | Graduation-week-unset card: if no graduation week is recorded by 8w0d, Today's focus surfaces "Ask your RE two things: when graduation happens, and what gets sent to your OB." |
| D-17 | P1-equivalent (shipped as P2) | **Fixed** | JSON export/import in Settings via copy/paste textarea (no network); calm one-line file:// caveat. Roundtrip test listed in §11 matrix. |
| D-18 | P3 | **Fixed** | Schema field `manageable` → `stage: "day-5 blastocyst"`. |
| D-19 | P3 | **Fixed** | Frozen example pair used everywhere: **transfer 2026-10-10 → EDD 2027-06-28 (+261 days); Oct 23 = 13 dpt = 4w4d.** |
| D-20 | P3 | **Fixed** | Test matrix added (§11): on-device vs code-review vs automated checks, with axe + VoiceOver sweep. |

Additional v1.1 additions beyond the defect log: dark mode is now **v1** (off by default, Settings toggle, persists, `prefers-color-scheme` default-follow); next-action ranking is a strict ordered list with tie-breakers returning exactly one action; clinic-hours call-routing logic; optional partner/support field + copy-to-clipboard "send update" template; empty/loading/error state spec for every screen; full ARIA/keyboard spec; honest <150KB cut list.

---

## 1. Design principles & anti-anxiety content rules (unchanged in substance, tightened in wording)

### Five design principles
1. **Calm is a feature.** Muted rose for urgent, never red-drenched screens. No stakes-implying badges ("RISK: HIGH" is banned; a thing either says "call today" or it doesn't).
2. **One next action, always visible.** Exactly one "Today's focus." Max 3 primary CTAs anywhere. Everything else is progressive disclosure. After a task completes, the app *stops* — the rewarded behavior of a finished day is stopping.
3. **Log ≠ Worry.** Logging is private and verdict-free. Tier decisions come from structured severity data, never from prose reading at panic speed.
4. **Clarity over reassurance.** No "everything is fine," no "not a worry." Say what a screen does tell her, what it can't, and what happens next — with a named mechanism or a next action. Reassurance rests on true mechanisms (e.g., "thresholds were built so a healthy pregnancy is never accidentally declared failed").
5. **Forgiving systems.** No streak-break messaging, no back-fill demands, no "shame" states. Missed doses handled in a 3-question flow. Re-entry after absence is one honest card, never a wave.

### Anti-anxiety content rules (enforced per screen)
| Rule | Bad | Good |
|---|---|---|
| No bare "failure/abnormal" | "Abnormal results mean—" | "Some results lead your clinic to simply look again in 7–14 days" |
| Percent → context → action | "Miscarriage risk: 15%" | "About 1 in 5 pregnancies have some first-trimester bleeding; most don't mean the pregnancy is failing — and any spotting is worth a call" |
| Symptoms ≠ health signals | "Track nausea to check the baby is OK" | "Symptoms go quiet for healthy pregnancies and loud for unhealthy ones — symptoms don't grade this; your scans do" |
| No doom-stacking | red banner + haptics + modal | one color-coded card with a plain verb |
| No invented certainty | "Your baby is perfectly healthy" | "Your clinic will check X on [date]" |
| No emoji in safety copy | 🚨 in red-flag card | text-only, icon allowed only outside safety strings |

---

## 2. Personas & top jobs-to-be-done

**Primary persona — "Maya," 34, first pregnancy after 2 IVF cycles, prior loss, PIO qHS, full-time work, iPhone SE (375 pt; must also survive 320 pt), laptop; 2 a.m. Googler. Currently ~4w4d after a day-5 blast transfer of a male embryo.** Secondary: her partner/one support person (receive, never log).

Top 5 jobs:
1. *In 10 seconds each morning, tell me what today needs — then get me off my phone.*
2. *When a symptom starts at 2 a.m., route me by my answers — log / call clinic / ER — without prose triage and without anything scary or falsely reassuring.*
3. *When I've missed a dose, give me a non-judgmental path that never double-doses or cold-turkeys, and shows me what the call will likely cover.*
4. *Between appointments, show me progress I can't yet see, week by week, including where "boy" comes from and what still can't be seen.*
5. *When taper/graduation/results moments arrive, tell me the question to ask before I know to ask it, and hold the waiting window with me.*

---

## 3. Sitemap & Navigation Model (v1.1 — D-07)

```
IVF Pregnancy Tracker
├── Onboarding (3 steps, skippable) ──► Demo Mode (seeded, shown "not your data"; demo Reset specified)
├── 1. Today ●
│   ├── Re-entry card (conditional; D-08) — outranks focus when shown
│   ├── Today's focus (exactly one; §9.1)
│   ├── Meds today (rows; single "missed — tap when ready" state, no ✗ grade)
│   ├── Context band (GA, EDD, next appointment in ≤14 days)
│   ├── Water & gentle nutrition (8-dot)
│   ├── Quick check-in teaser (→ Check-in tab)
│   └── Calm line of the day
├── 2. Protocol
│   ├── What's next card · Meds list & schedules · Refill countdown (≥7 d buffer)
│   ├── Taper/stop window card (placeholder-aware; §9.7) · Injection-site rotation
│   ├── Missed-dose flow (3 questions, 2 branches + details preview)
│   └── Appointments timeline (betas → 6–7w scan → graduation → NT → NIPT → anatomy)
├── 3. Check-in
│   ├── 30-second daily log → conditional severity follow-up (§9.2)
│   ├── Trend (CSS sparkline; neutral axes; no verdicts)
│   ├── Worry journal + 15-min worry window · Grounding (box breathing, 5-4-3-2-1)
│   └── Link: "Call clinic — uncertainty counts as a reason"
├── 4. Little One
│   ├── "You are here" marker; weeks 5–22 cards (copy in deck §6)
│   ├── Boy milestones (SRY ~w6–7; testosterone w8–12; anatomy confirm 18–22)
│   └── Celebrations (dismissible, toggleable)
├── Safety (pinned pill; modal; ≤1 tap from anywhere; tel: buttons)
├── Learn / FAQ (12) — from Settings + in-card links in Protocol/Check-in
└── Settings / My Protocol
    ├── Transfer date (EDD = +261 d) · Clinic phone + after-hours phone + clinic hours
    ├── Partner/support person (optional) · Med schedule editor · Notification prefs
    ├── Dark mode (off default; follow-system option) · Celebrations toggle
    ├── Export JSON / Import JSON (copy-paste textarea) · Print handout
    └── Data reset (typed confirmation) · Demo-mode reset · Privacy note
```

### Navigation
- **Mobile (320–375 pt):** bottom row = exactly **5 targets**: `Today · Protocol · Check-in · Little One · Safety-pill` (rose-outlined, last position). Header shows only: context date (left) and "Settings" text link (right, ≥44×44). Phone lives in the Safety modal, inline red-flag cards, and the context band — never as a duplicate header button. 320 pt rule: no more than 5 actionable targets per horizontal band; tab labels abbreviate ("Today · Protocol · Check-in · Little One · Safety").
- **Desktop:** left sidebar (same 5 + Learn + Settings); content max-width 720 px; sticky "Call my clinic" bottom-right.
- **Keyboard:** 1–4 jump tabs; `S` opens Safety; `Esc` closes any sheet/modal restoring last focus; full tab-order matches visual flow; skip-link to main content.

---

## 4. Wireframes (ASCII; mobile-first, desktop noted)

### 4.1 Today
```
┌──────────────────────────────────────┐
│ Today · Oct 23              Settings │   ← no phone, no gear cluster
├──────────────────────────────────────┤
│ 4w4d · EDD Jun 28, 2027              │   ← context band (+ tel: small)
│ Next visit — · none yet              │
│ ┌ Re-entry card (conditional) ──────┐│
│ │ Welcome back. Nobody's behind.    ││
│ │ Last recorded PIO dose: Oct 18.   ││
│ │ PIO refills: running low.         ││
│ │ [Check that when you're ready]    ││
│ └───────────────────────────────────┘│
│ ┌ Today's focus ────────────────────┐│
│ │ It's evening-window time for PIO  ││
│ │ (scheduled 8:00 pm).              ││
│ │ [Mark done]                       ││
│ └───────────────────────────────────┘│
│ Meds today                            │
│  ☐ Prenatal ✓  ☐ PIO — window 7–10pm │
│  Estrogen · missed this morning —    │
│  tap when you're ready               │
│ Water ☐☐☐☐☐☐☐☐ 3/8 · Check-in teaser │
│ ┌ calm line ────────────────────────┐│
│ └───────────────────────────────────┘│
├──────────────────────────────────────┤
│ Today Protocol Check-in  Little One ◉Safety│
└──────────────────────────────────────┘
```
*Desktop:* 2-column grid (focus+meds left; check-in+calm right); sticky "Call my clinic" bottom-right.

### 4.2 Protocol — see v1.0 §4.2 unchanged, plus taper placeholder badge "(most common — not necessarily yours)" and graduation-unset card at ≥8w.

### 4.3 Check-in with severity follow-up (D-01/D-02)
```
┌──────────────────────────────────────┐
│ ← Check-in          Worry journal · Grounding│
│ 30-second check-in                    │
│ Nausea ⬤⬤○○○○○○○○  Fatigue ⬤⬤⬤○○○○○○○○│
│ ☑ Spotting  ☐ Cramps  ☐ Slept ok      │
│ Anxiety ⬤⬤○○○○○○○○                    │
│ ┌─ You tapped Spotting — one more ──┐│
│ │ How much?                         ││
│ │ ( ) Spots only ( ) Light flow     ││
│ │ ( ) Soaking a pad ≤1 h            ││
│ │ ( ) Clots or tissue               ││
│ │ ☐ Dizzy or fainted                ││
│ │ [Continue]                        ││
│ └───────────────────────────────────┘│
│ (Same screen shape for Cramps: pain   │
│  level, one-sided?, shoulder-tip?,    │
│  dizzy/fainted?)                      │
├──────────────────────────────────────┤
│ [ Save check-in ]  → toast "Noted."   │
│ (Trend ▾) · (Call clinic — worry ok)  │
└──────────────────────────────────────┘
```
*Tier-2 answer* (e.g., "Clots or tissue" or "Soaking a pad ≤1 h", or cramps: severe / one-sided / shoulder-tip / fainted) → **Safety modal opens on tap of Continue, Tier 2 in view**. *Tier-1 answers* → the inline call-clinic card below Save. Decision table: §9.2.

### 4.4–4.7 Little One / Safety modal / Missed-dose / Onboarding — layout unchanged from v1.0 §4.3–§4.7 with these copy/logic deltas: missed-dose Branch A gains the `<details>` clinic-answer preview before the call; Safety modal reorders 911/ER **above** clinic when a Tier-2 context opened it; onboarding Step 3 dose editor includes stop-week "per your RE — leave blank until they tell you."

---

## 5. Screen-by-screen spec

| # | Screen | Primary CTA | Empty | Loading | Error/edge | Notes |
|---|---|---|---|---|---|---|
| 1 | Today | Mark done / per focus | Onboard/demo prompt | Instant (local) | future transfer date → "Not yet — check the transfer date?" | Re-entry card outranks focus when present (§9.5). Calm band always. |
| 2 | Focus card | per action type | — | — | Tier-2 context → becomes "Open Safety now" | Post-done state fixed (D-04): confirm + stop. |
| 3 | Meds today | Mark done per row | "No meds yet — add in Settings or pick a template" | — | missed row shows neutral "missed this morning — tap when you're ready" (no ✗, no red) | Window logic §9.3. |
| 4 | Water | implicit | "Small goals count" | — | — | passive; never a nag. |
| 5 | Check-in | Save | "First check-in — 30 seconds" | — | severity follow-up interrupts Save until resolved; Tier-2 → modal | Verdict-free save; trend neutral axes. |
| 6 | Protocol | Prep next visit / tel: | "Add meds or explore demo protocol" | skeleton on week calc | unknown taper → placeholder copy; graduation unset at ≥8w → D-16 card | What's-next always. |
| 7 | Missed dose | tel: (A) / resume (B) | — | — | never dead-ends; evergreen: never double, never cold-turkey | Branch details in deck §4. |
| 8 | Appointments | Read what to expect / waiting plan past→unanswered → decompression prompt; "No appointments yet" state; past-visit unanswered → decompression prompt. | skeleton nodes | — | indeterminate scan → waiting plan (D-14). Graduation card always has "prepared?" | |
| 9 | Little One | See next week (unlocks weekly) | before 4w0d → "a few days from week 4" | skeleton card | past 22w → "Your OB is leading now 🎉" | Weeks 5–22 all readable retro. |
| 10 | Celebrations | dismiss | always ≥1 (transfer) | — | disabled by toggle | restrained copy (deck §6.4). |
| 11 | Safety modal | tel: buttons | if no phone stored → "Set clinic number in Settings" | — | — | opened by Tier-2 context = Tier 2 scrolled first. |
| 12 | Worry journal | Postpone / Save | "First worry — it's ok to put it down" | — | — | window timer. |
| 13 | Grounding | Start | — | — | reduced-motion → text countdown | 2 scripts (deck §5). |
| 14 | Learn/FAQ | — | — | — | — | 12 Qs ≤120 w each. |
| 15 | Settings | Save | — | — | import validation shows preview + confirm | JSON export/import; file:// caveat one line. |
| 16 | Print handout | Print | — | — | — | expands details, keeps [VERIFY LOCALLY], page-breaks per zone. |

Every screen has an empty state (above table), **loading**: not needed offline — static skeletons only during localStorage hydration; **error**: if `localStorage` throws/quota-fails → run in-memory with a persistent one-line warning "Saving isn't working in this browser — your entries last until you close this tab. Consider exporting a copy." Data-loss events are never silent.

---

## 6. Component library spec

### Tokens (fix; unchanged core from v1.0)
| Token | Value |
|---|---|
| `--bg / --surface / --surface-alt` | `#FAF7F2 / #FFFFFF / #F1EDE4` |
| `--text / --text-muted` | `#2E3330` (12.4:1) / `#5E6A63` (4.9:1) |
| `--primary / --primary-contrast` | `#5F7F6F` / `#FFFFFF` |
| `--secondary` | `#6B8CA5` (4.6:1) |
| `--accent / --urgent / --urgent-deep / --warn / --ok` | `#F2B28C` / `#A65A62` (5.5:1) / `#7A3E45` / `#C99359` / `#5F7F6F` |
| radii / spacing / motion / type-scale / line-length / touch | per v1.0: 8–18px · 4–64 grid · ≤200 ms · 13–36px · 68ch · ≥44px |

**Dark mode (new in v1.1, off by default):** bg `#1F2522`, surface `#272E2A`, text `#F3EDE3`, muted `#AEB8B1`, primary-lightened `#8FAE9B`, secondary-lightened `#8FAFC7` (AA on dark surface: text 11.8:1, primary 5.6:1, secondary 4.8:1, rose-lightened `#C9828C` 5.4:1). Toggle in Settings: Light / Dark / Follow system; persists in settings JSON. 2 a.m. use is real; dark default strengthens the margins without imposing it.

**Cut list to keep the single file <150KB (honest)**: no chart library (CSS-bar sparkline built from divs); inline SVG icons only (12 icons, ~4KB total); no icon font; no animation library; no datepicker library (native `<input type=date>`); no markdown renderer in-app (app renders copy directly); fonts = system stack; no polyfills beyond ES2018; scrubber/extras omitted; copy deck strings live once each as data or template literals.

---

## 7. Copy deck pointer
All verbatim, final strings — global strings, onboarding, Today, Protocol (incl. all missed-dose branches), Check-in severity questions and tier cards, weeks 5–22 cards, 12 FAQs, Settings, error/toast/empty states, print headings — are in **`02b-copy-deck.md`**. Tone rules enforced there: warm, direct, second person, short sentences, ~8th-grade reading level, no exclamation stacks, no "momma," no emoji in safety copy, every reassurance names a mechanism or a next action.

---

## 8. Data model (localStorage JSON schema v2)

Root key `ivf-tracker-state/v2`.
```json
{
  "schemaVersion": 2,
  "profile": {
    "transferDate": "2026-10-10",
    "embryo": { "day": 5, "sex": "male", "stage": "day-5 blastocyst" },
    "clinic": { "name": "", "phoneMain": "", "phoneAfterHours": "",
                "hoursDays": "Mon-Fri", "hoursStart": "09:00", "hoursEnd": "17:00" },
    "support":  { "name": "", "relation": "", "phone": "" },
    "lossHistory": false,
    "onboarded": true,
    "demoMode": false
  },
  "meds": [
    { "id": "pio", "name": "Progesterone in oil", "route": "IM gluteal",
      "dose": "1 mL", "timeOfDay": "20:00", "stopWeek": null, "stopType": null,
      "isActive": true, "isHormonal": true,
      "refill": { "daysOnHand": 4, "bufferGoal": 7, "lastOrdered": null } },
    { "id": "prenatal", "name": "Prenatal vitamin", "route": "oral",
      "dose": "1 tab", "timeOfDay": "10:00", "stopWeek": null,
      "isActive": true, "isHormonal": false }
  ],
  "doses": [ { "medId": "pio", "date": "2026-10-23", "taken": true,
               "takenAt": "2026-10-23T20:14:00", "logType": "taken" } ],
  "siteRotation": [ { "date": "2026-10-23", "site": "right-glute-upper-outer" } ],
  "logs": [
    { "date": "2026-10-23",
      "nausea": 2, "fatigue": 3, "sleepOk": true, "anxiety": 3,
      "spotting": { "reported": true, "amount": "spots",
                    "dizzyOrFainted": false },
      "cramps": { "reported": false, "painLevel": null,
                  "oneSided": false, "shoulderTip": false,
                  "dizzyOrFainted": false },
      "heavyBleed": false, "fainted": false, "fever": null,
      "fluidsDown24h": false,
      "freeNote": "", "resultedAction": null }
  ],
  "appointments": [
    { "id": "us1", "label": "First ultrasound", "weekTarget": 6,
      "plannedDate": "2026-11-04", "actualDate": null,
      "status": "scheduled", "outcome": null }
  ],
  "milestones": {
    "graduation": { "targetWeek": null, "status": null },
    "ntScan": { "targetWeek": "11-13.6", "status": null },
    "nipt":   { "targetWeek": ">=10", "status": null },
    "anatomyScan": { "targetWeek": "18-22", "status": null }
  },
  "worryJournal": [ { "date": "2026-10-23", "text": "", "postponed": false } ],
  "worryWindow": { "enabled": false, "timeOfDay": "17:00", "lastSeen": null },
  "celebrations": { "seen": { "day5Blast": true }, "enabled": true },
  "settings": {
    "celebrationsOn": true, "reducedMotion": "follow-system",
    "darkMode": "light", "notifications": { "meds": true, "refills": true }
  },
  "meta": { "lastOpened": "2026-10-23T20:14:00", "appVersion": "1.1" }
}
```
Demo mode seeds its own namespaced key (`ivf-tracker-demo/v2`) — never writes into the real key; a real-profile start runs **demo reset** first (D-15/S1). Reset requires typing `RESET`.

---

## 9. Interaction logic (v1.1)

### 9.1 Next-action ranking — exactly one action, never guilt
Ordered; first match wins; tie-breakers in parentheses:
1. **Restore-continuity rule**: `lastOpened ≥ 2 days` → Re-entry card IS the focus (tie-break: ≥7-day gap uses the same card copy; flyer-panic guard: the card never asks back-filling questions).
2. **Tier-2 condition** — any Tier-2-positive input today (§9.2 table) → Focus = "Open Safety now" (tap → modal Tier 2).
3. **Unhandled Tier-1 event** — spotting/cramps logged today with Tier-1 severity not yet acknowledged-with-a-call → Focus = "Call your clinic about what you logged today."
4. **Refill pressure** — any active med `daysOnHand < 7` → "Order your refill" (tie-break: lowest days; PIO outranks others at equal days — lead time).
5. **Graduation unset at ≥8w0d** (D-16) → "Ask your RE: graduation week + records handoff."
6. **Med due/late** — within window (§9.3) → "Take {med} now" (tie-break: most-overdue within window; PIO > vaginal prog > estrogen > oral).
7. **Appointment ≤7 days** → "Prep for {appointment}".
8. **Check-in not done today** → "Log today's check-in — 30 seconds."
9. **Water <6/8 after 3 p.m.** → gentle drink nudge.
10. **Fallback** → "Nothing needs you right now." + [📞 Call clinic] [Grounding].

Nothing in 1–10 is ever phrased as fault or grade. Items 2–3 can interrupt focus once per day max; re-entry (1) shows until dismissed-today.

### 9.2 Severity/tier decision table (D-01/D-02) — data-driven

**Spotting follow-up inputs:** amount ∈ {spots, light-flow, soaking-pad≤1h, clots-or-tissue}; dizzyOrFainted bool.
**Cramps follow-up inputs:** painLevel ∈ {mild, moderate, severe}; oneSided; shoulderTip; dizzyOrFainted.

| Spotted? | amount | any of: dizzy/fainted | Tier |
|---|---|---|---|
| any | clots-or-tissue (esp. large or gray/white tissue) | — | **Tier 2** |
| any | soaking-pad≤1h | — | **Tier 2** |
| any | spots or light-flow | yes | **Tier 2** (bleeding + dizziness) |
| any | spots or light-flow | no | **Tier 1** — clinic call (any spotting → call; "light/brown" never grants a skip) |

| Cramps? | painLevel | oneSided | shoulderTip | dizzy/fainted | Tier |
|---|---|---|---|---|---|
| any | any | any | any | **yes** | **Tier 2** (classic ectopic picture — ER now) |
| any | severe | any | any | no | **Tier 2** (severe/worsening pain) |
| any | any | yes | any | no | **Tier 2** (one-sided pain — ER, not the morning after) |
| any | any | no | **yes** | no | **Tier 2** (shoulder-tip suggests internal bleeding) |
| any | moderate | no | no | no | **Tier 1** (new/moderate, not one-sided) |
| any | mild | no | no | no | Tier-0 info card (patterns from doc §4/§5: both-sided period-like is common) + quiet [Call if you want] |

**Stand-alone Tier-2 switches (render Safety modal Tier-2 whenever true):** heavyBleed; fainted; fever ≥100.4°F (38 °C) with any other symptom; fluidsDown24h (can't keep fluids down 24 h); chest pain/shortness of breath at rest/coughing blood (stored as `note` → always Tier 2); thoughts of self-harm or of harming the baby (perinatal mental-health emergency: 988/OB/ER).

**Routing rule:** Tier 2 → Safety modal opens immediately on [Continue], Tier 2 section scrolled into view, 911/ER **first**, clinic second, and inline "Log & mention" vocabulary is greyed (logging is not the action now). Tier 1 → inline card below Save: "call-clinic" emphasis with both verbs. Tier 0 → neutral info line only.

### 9.3 Med "due window" logic (D-03/D-04)
- Per med, define `open = scheduled − 60 min`, `close = scheduled + 2 h`.
- Before `open`: never surfaced (not "somewhat soon" — plain nothing).
- In `[open, taken)` or `[scheduled, close)` untaken: surfaces "take now."
- After `close` untaken: leaves focus; missed-dose flow becomes rank #2/#3 context. It is **never still nagging at 13 h early**.
- Same-day-recheck: after any taken, next-dose line updates to tomorrow's scheduled time in the meds row ("Next: tomorrow 8:00 pm").

### 9.4 Missed-dose logic (D-05/D-06)
- Entry → 3 questions max → two branches:
  - **A · PIO (any gap)** → "Clinic call, not a guessing game." `<details>` preview of the two likely clinic answers (skip-and-resume / take late) · CTAs: [📞 Main] [📞 After-hours] [Copy note]. Never self-executes.
    - **B · vaginal progesterone/estrogen/oral (same day)** → `<2–8 h` ago: "take now." Later same day: "fine to take late; never a double dose." Any **progesterone/estrogen gap >24 h**: "call before restarting." Never cold turkey.
- Evergreen footer on both branches: never-double / never-cold-turkey / progesterone-off >24 h → call first (doc L67–L70).
- Re-entry (9.5) counts the last recorded dose: ≥2 days since last active hormonal dose dated reality-check card (not an alarm wave); if ≥2 days unknown → same card in "we don't know — that's ok, one call clears it" variant; **no back-fill prompts, no per-day nag stacking**.

### 9.5 Re-entry & forgiving counts (D-08)
- Gap 1 day: no special state at all; counts continue as "days you checked in: 6."
- Gap 2 days: one-line soft card: "Welcome back. Nobody's behind here." + last dose date + refill status.
- Gap ≥2 days: full re-entry card (§4.1) — last recorded dose truth, refill state, and, if the last recorded dose of a hormonal med is more than 24 h before now: one explicit line — "More than a day off progesterone or estrogen is always worth a quick call before restarting — the clinic sets the resume plan; it's a two-minute call, not an alarm." Zero questions, zero guilt, zero streak. Dismisses for the day.
- Gap ≥7 days: adds a second line — `Remember the rule that holds at any gap: nobody restarts hormones by guesswork after a day-plus off. That's the entire ask.` and nothing else.
- Wording: **"days you checked in"** after they re-open, not "streak". Counts never computed in demo or while anxiety ≥8.

### 9.6 GA/EDD (frozen example: D-19)
`dpt = today − transferDate`; `GA = (dpt + 19)/7 → wXdY`; `EDD = transferDate + 261`. Display example pair everywhere: **transfer 2026-10-10 · EDD 2027-06-28 · 4w4d on 2026-10-23.**

### 9.7 Call availability
Default clinic hours Mon–Fri 9:00–17:00 (editable). While hours open → [📞 Main] shown primary, "After-hours" secondary only if stored. Outside hours → [📞 After-hours] primary, labeled "After hours now"; if none stored: "Call the main line — if it's closed, the recording will route you." Safety modal always shows 911/ER above clinic when the open-context is Tier 2.

---

## 10. Markdown dashboard structure (D-11 fix)
As v1.0 §10 with: proper pipe-header rows on **every** table (`| Med | Route/Dose | Time | Stop window |` + `|---|---|---|---|`); anchors from GitHub's auto-slug (dashes + lowercase, verified once in GitHub's renderer before ship); `<details>` for progressive disclosure and all FAQs; checklists rendered as editor-toggled task lists; the "print this" block expands on print and keeps `[VERIFY LOCALLY]` markers.

---

## 11. ARIA, keyboard & QA checklist (D-20 matrix)

- Full Aria labels for: tabs (`role=tablist/tab`, arrow keys); Safety modal (`role=dialog aria-modal=true`, `Esc`, focus trap + restore, `aria-labelledby="safety-title"`); severity cards (`role=radiogroup` for amount/pain levels; checkbox triage announces "selected" state, never just a shape change); toasts (`role=status aria-live=polite`; Tier-2 toast uses `aria-live=assertive` once, no repeats).
- Focus rings always visible; skip-link; 44px targets; contrast verified per-pair (§6).
- [x] animates ≤140 ms and **state changes are also announced** via label/log change (color-independent status).

### Test matrix (D-20)
| Check | Who/how |
|---|---|
| axe automated pass (Today→Safety→Check-in) | automated |
| VoiceOver full sweep: Today → Safety (Tier 2) → severity follow-up → missed PIO → back | on-device |
| 320 pt layout: 5-target nav, ≥44px targets, no overflow | on-device |
| reduced-motion: breathing→text-countdown; celebrations instant/dismissible | on-device |
| tel: buttons dial from file:// on iOS/Android | on-device |
| localStorage corruption → in-memory fallback; import-export roundtrip once | automated + on-device |
| dark mode AA contrast; celebrations off; demo reset leaves zero residue | code-review + on-device |
| Tier decision table applied to 12 walkthroughs of Gamma's scenarios (incl. S5, S12) | code-review vs data tables |
| [VERIFY LOCALLY] markers survive in print output | code-review |

---

## 12. Risks, tradeoffs & deliberate omissions
As v1.0 §12, updated: weight/BP, kick counter, names, multiples track, "still-nauseous health meter", loss-scores, beyond-22w content — all still out. New risks to surface at clinician sign-off: the §9.2 decision table mapping (Gamma flag #1); >24h hormonal-gap phrasing (flag #2); taper fallback named as a placeholder in copy (flag #3); boy-week second-trimester "testes not in scrotum = normal" wording needs OB-read (flag #5); 988 scope wording (flag #6). Dark mode adds ~3KB and a Settings toggle instead of leaving it out — accepted.

*End of v1.1. Copy deck: `02b-copy-deck.md`.*
