# 02b — Final Copy Deck (v1.1) — exact, implementation-ready strings
**Companion to `02-ux-blueprint.md` v1.1. No placeholders except template variables, which are all defined in §0.2. Tone enforced throughout.**

**Tone rules (binding):** warm, direct, never patronizing; second person; short sentences; no exclamation stacks; no "momma"; no "rainbow baby" unless the user opts in (a loss-history is acknowledged only through the gentle variants below); **no emoji in any safety copy**; celebratory but restrained; ~8th-grade reading level; every reassurance names a mechanism or a next action; never false reassurance ("everything is fine," "not a worry," "don't worry" are all banned strings).

---

## 0. Global

### 0.1 Standing strings
- **Disclaimer (footer of every screen; first line of Markdown doc):**
  "This tracker is education, not medical advice. Your clinic's instructions always outrank anything here. Nothing should be started, stopped, or changed without your RE or OB."
- **Safety pill (nav):** `Safety` — always 1 tap away.
- **Crisis footer (Safety modal, bottom; also appears after any self-harm/intrusive-thought input):**
  "*If you're having thoughts of harming yourself or the pregnancy, that's a medical emergency, not a character flaw. Call 988 (Suicide & Crisis Lifeline), your OB, or go to the ER. Help exists during pregnancy, not just after.*"
- **Data privacy line (Settings header + onboarding step 1 helper + app footer):**
  "Everything lives on this device only. No accounts, no analytics, no internet calls. Opened without Wi-Fi? Still works."
- **file:// caveat (one line, under Export):**
  "If you open this file from a phone's Files app, saved data can occasionally vanish on some devices — a one-tap export to Notes is cheap insurance."
- **Demo banner (persistent while demo):** "Demo mode — not your data. Nothing here saves, and this seed resets anytime."
- **Post-save toast:** "Noted." (Tier-1 events add a second sentence: "The clinic card stays below whenever you want it.")
- **Empty-fallback app error (localStorage unavailable):** "Saving isn't working in this browser. Your entries last until you close this tab — consider exporting a copy from Settings."

### 0.2 Template variables (the only placeholders allowed, all defined)
| Var | Meaning | Source |
|---|---|---|
| `{ga}` / `{edd}` | gestational age "4w4d" / due date "Jun 28, 2027" | computed (frozen example: transfer 2026-10-10 → EDD 2027-06-28; Oct 23 2026 = 4w4d) |
| `{med}` / `{dose}` / `{time}` | medication name / dose string / scheduled clock time | meds data |
| `{reason}` | one line the app fills from the triggering log ("you logged spotting today") | computed |
| `{days}` | countdown integer ("12 days") | computed |
| `{main}` / `{after}` / `{line}` | clinic main / after-hours phone (tel: digits) | profile |
| `{window}` | med's due window, e.g. "7:00–10:00 pm" | computed (scheduled −60 min to +2 h) |
| `{appNextVisitDate}` / `{repeatScanDate}` | appointment dates | appointments |
| `{partnerName}` | support person name (optional) | profile.support |
| `{w}` | current gestational week | computed |

---

## 1. Onboarding (3 steps, skippable)

**Welcome screen**
- **Title:** "Welcome. Let's set the basics — 60 seconds, and none of it is graded."
- **Body:** "The app only needs one date to be useful: your transfer date. Everything else is optional and editable later in Settings."
- **Buttons:** `[Explore demo mode]` `[Get started →]`
- **Privacy line** under both (0.1).

**Step 1 — Transfer date**
- **Label:** "Transfer date"
- **Helper:** "Your due date comes from this: transfer day + 261 days. That's the standard math for a day-5 blastocyst."
- **Validation errors:**
  - Empty: "A date is the one thing we need — even an approximate one works."
  - Future date: "That date's in the future. Is it possible the day got mistyped?"
  - >120 days past: "That's over 4 months ago — if that's right, your care has likely moved on to your OB. If it's actually recent, tap to edit."
- **Skip button (always visible):** `Skip for now` → helper becomes "Without a transfer date, the week tracker stays locked. Everything else works."

**Step 2 — Clinic phone**
- **Label:** "Clinic phone number" · **Helper:** "This becomes the call button on every safety card. Optional, but it earns its place."
- **Second field:** "After-hours line (optional)". **Third:** "Clinic hours — default 9–5, Monday–Friday."
- **Validation:** empty = fine (skip); non-digit-only → "Phone numbers with digits and maybe a '+1' work best."
- **Reassure:** "If you don't have the after-hours number handy, the main number usually records it after closing."

**Step 3 — Meds (or skip entirely)**
- **Label:** "Your medications"
- **Helper:** "Pick any that match, then tap a card to set the dose and time exactly as your clinic prescribed. Leave the stop week blank until your RE tells you one."
- **Templates:** PIO (IM, daily) · Vaginal progesterone (once or twice daily) · Estradiol (oral) · Low-dose aspirin 81 mg · Prenatal vitamin.
- **Each card has:** name, route, dose field, time field, and — for PIO and vaginal progesterone only — a "This is a hormonal medication" flag with the line "Missed-dose help for these always ends with your clinic."
- **Skip:** `Skip — no meds yet` → helper on Settings' med page later: "Add them whenever. Nothing broke."

**Finish screen**
- **Headline:** "You're set."
- **Body:** "Today's view is ready. If anything looks off — a dose, a time — Settings fixes it in ten seconds."
- **CTA:** `[Open Today]`

---

## 2. Today screen

### 2.1 Greeting variants
| Time | Copy |
|---|---|
| 5:00–11:59 | "Good morning." |
| 12:00–17:00 | "Good afternoon." |
| 17:01–22:00 | "Good evening." |
| 22:01–4:59 | "Late night, I see. Nothing here needs urgent attention — if something physical is happening right now, the Safety button below knows what to do." |

### 2.2 Context band (above the fold)
`{ga} · due {edd}`
- With appointment in ≤14 days: add "· {label} in {days}"
- With none: "· next appointment TBD — see Protocol"
- Small tel: under band: "Call my clinic" (only if a number exists).

### 2.3 Today's focus card — copy per action type
| Rank trigger | Card headline | Body | CTA |
|---|---|---|---|
| Re-entry (≥2 days) | "Welcome back." | "Nobody's behind here. Two honest facts before anything else: your last recorded PIO dose was {date}. Your PIO on hand looks low." (+ if >24 h since last hormonal dose: "More than a day with no progesterone or estrogen is worth a two-minute call before restarting — the clinic sets the resume plan; that's the whole ask.") | `[Check that when you're ready]` (→ Protocol, refill block open) `[Call clinic]` [+after-hours per hours logic] |
| Tier-2 condition | "Open Safety now." | "Something you logged today fits the go-now list. The Safety panel shows what to do, in order, with the numbers first." | `[Open Safety]` |
| Unhandled Tier-1 | "Call the clinic today." | "About: {reason}. You don't need a script — 'I'm {ga} post-transfer and wanted to check a symptom' is complete." | `[Call clinic]` `[Log & mention at next visit]` |
| Refill pressure | "Order your {med} refill." | "You have about {days} days on hand. The 7-day buffer rule exists because pharmacies — especially compounding ones — sometimes need lead time on PIO." | `[Mark ordered]` `[Not yet — remind me tomorrow]` |
| Graduation unset ≥8w | "Two questions for your RE." | "When is graduation to your OB, and what gets sent over in your records? If neither is on paper yet, this visit's the moment." | `[Call clinic]` `[Noted at my visit]` |
| Med in window | "It's time for your {med}." | "Scheduled {time}; window {window}." (For PIO add: "Site rotation is in Protocol if you want the next spot.") | `[Mark done]` |
| Appointment ≤7d | "Your {label} is {days} away." | "Reading the 'what it can tell you / can't yet' for this one takes 2 minutes and reliably lowers the imagination tax." | `[Prep for this visit]` |
| Check-in open | "Log today's check-in." | "30 seconds, no verdicts. It's yours, not a grade." | `[Start check-in]` |
| Water nudge | "Drink some water." | "Six glasses by 9 — that's plenty. Small sips count double when you're queasy." | `[Counted]` / dismiss |
| Fallback | "Nothing needs you right now." | "The calendar's clear, the meds aren't due yet. Want a two-minute grounding anyway?" | `[Grounding]` `[Call clinic]` |

**Post-"Mark done" (D-04):** toast — "Done. That's the day's main thing handled." Focus card then reads:
> "The rest of today is optional. The next scheduled item is {next line, e.g. 'PIO tomorrow at 8:00 pm'}."
No new chore is promoted for the rest of that day (check-in gets exactly one teaser line under the water card instead of the focus slot).

### 2.4 Meds rows
- Row states: due-in-window ("take now" emphasis), not-yet-due ("Scheduled {time}; window {window}"), taken ✓, **missed** (neutral): "{med} · missed this morning — tap when you're ready."
- "Mark all done" exists only when 2+ meds are in-window simultaneously.
- Tap a missed row → missed-dose flow (§4.5 of deck).

### 2.5 Water & gentle nutrition
- Headline: "Water & gentle eating." Subhead: "Small sips. Small meals. Salt and plain crackers are legitimate tools, not failures."
- 8-dot counter; label "Sips count." One rotating tip line (6, from clinical doc): e.g. "Ginger and small, frequent bland meals are the classic nausea kit — worth asking your OB about B6 too."

### 2.6 Check-in teaser (when check-in not done)
"30-second check-in — for you, not a grade." `[Start check-in]`

### 2.7 Calm line library (≥10; one per day, rotating)
1. "Around 8–12 weeks your placenta takes over the progesterone job — the taper happens *then*, and only on your RE's call."
2. "This is exactly the stretch where healthy pregnancies progress uneventfully."
3. "Symptoms go quiet for healthy pregnancies and loud for unhealthy ones — symptoms don't grade this. Your scans do."
4. "One beta number isn't the story; the trend is. Your clinic is watching the whole trend, not today."
5. "Ultrasound thresholds are deliberately conservative — built so a healthy pregnancy is never declared failed by mistake."
6. "Mild, both-sided, period-like cramps come from the uterus stretching. One-sided or severe is what the call exists for."
7. "You're allowed to feel excited and scared at the same time. Both belong here."
8. "The anxiety you carry comes from real history — it isn't evidence about today."
9. "Your baby's testes will travel down in the third trimester; on second-trimester scans, 'not descended yet' is the normal finding."
10. "Testosterone ramping around weeks 8–12 is a boy milestone — a quiet one; the baby never notices."
11. "An unremarkable day is still a good day. Most of this journey is quiet."
12. "Clinics differ on timing all the time. Yours does it the right way *for you*."

---

## 3. Protocol screen

### 3.1 What's next card
- Headline: "What's next."
- Body: "{label} — {weekday, month day} · {ga arrow} · {days} days away."
- CTA: `[Prep for this visit]`.
- If nothing scheduled: "Nothing on the calendar. In early IVF pregnancy, that usually means betas are done and your first scan is worth putting a date to." `[Call clinic]`

### 3.2 Med cards
- Header: name + route + dose + scheduled time.
- Body line (hormonal): "The placenta takes over between 8–12 weeks. Stopping is your RE's decision, never a to-do item."
- Injection-site rotation (PIO only): "Sites: upper-outer glute, alternate left/right each day, warm compress 5–10 minutes before, gentle massage after. Lumps and soreness are common — the oil is irritating; some firm nodules take weeks to resolve. Spreading redness, warmth, or fever → call."
- Never ask her to grade a site beyond left/right/date.
- "Never stop PIO because a site hurts — call instead."

### 3.3 Refill states
| State | Body | Color |
|---|---|---|
| ≥14 days | "{med}: {days} days on hand. Buffer's fine. Next reminder lands 7–10 days out." | sage |
| 7–13 days | "{med}: {days} days on hand — inside the buffer window. Order when convenient this week." | amber |
| <7 days | "{med}: {days} days on hand. Order today — PIO is an oil special-order at many pharmacies; lead time is real." | amber, top of card |
| Out / 0 | "{med}: none on hand. Call the pharmacy and the clinic both — never skip-pause a hormone med to stretch a supply." | rose, CTA-first |

### 3.4 Taper/stop window card
- If stop week recorded: "Stop window: week {w} ({type: taper/hard stop}), per your RE. Within it, your clinic leads; you follow. If cramping or light spotting shows up after a stop — that's a known withdrawal effect, and still always report any bleeding."
- If unset: "Stop window: not set yet. Most clinics land somewhere in weeks 8–12 — that's the most common answer, **not necessarily yours**. Worth asking explicitly: 'What exact week do I stop, and is it a taper or a hard stop?'"

### 3.5 Missed-dose flow — all branches, final copy
**Entry screen:** "You missed a dose. This happens, and it's fixable. Three quick questions, then the right path."

**Step 1** "Which medication?" (list from active meds).
**Step 2** "Roughly how long ago?" → `[Under 2 hours]` `[2–8 hours]` `[8–24 hours]` `[More than a day]`
**Step 3** Appears only for non-PIO: "Have you already taken anything about it?" `[No]` `[I took something extra — double]`

**Branch A — PIO (any gap):**
- Headline: "A missed PIO dose is a clinic call, not a guessing game."
- Body: "They'll either say skip-and-resume, or take it late. Never a double dose; never stop cold turkey."
- `<details> "What the call will likely cover":`
  > "Two common answers from clinics: (1) skip the missed dose and take tomorrow's on schedule, or (2) take today's dose late and keep the normal schedule after. Which one they pick depends on their protocol and how late it is. You don't need to pick in advance — just have your schedule open and read them your timing."
- `[Call the main line]` `[Call the after-hours line]` — per hours logic — "If the clinic's closed and no after-hours line comes up, leave the message at the main line; clinics staff this exact call after hours."
- `[Copy a note for the call]` → clipboard: "I'm {ga}. I take PIO 1 mL IM daily at {time}. I missed the {date} dose. It's been about {hours} hours. What do you want me to do — skip-and-resume or take it late? I won't double up without your say-so."
- Footer: "Never two doses to make up one. Never stop cold turkey."

**Branch B — vaginal progesterone / estradiol / aspirin / prenatal:**
- Under 2–8 h: "Take it now, at your next scheduled time keep the regular rhythm."
- Same day, later: "It's fine to take it late — today is still 'the day.' Never take two to catch up."
- Any hormonal med, gap **more than 24 h**: "Off progesterone or estrogen for more than a day: call before restarting. Don't restart with a double — the clinic will set the resume plan." `[Call main]` `[Call after-hours]`.
- Footer (both branches, identical): "Antibiotics, antifungals, opioids, and other prescriptions can interact with IVF support meds — mention the regimen to every prescriber." (carries [VERIFY LOCALLY] with your clinic's interaction list.)

**Ending screen (both branches):** "Handled. Nothing punitive here — missing one dose isn't an emergency; guessing is the only risk. You did the right thing by checking." `[Back to Today]`

### 3.6 Appointment cards (6 templates: beta #1, beta #2, 6–7w scan, graduation, NT + NIPT, anatomy) — each with 5 fixed panels
Common 5 panels per card: `What happens` · `What it can tell you` · `What it can't tell you yet` · `How to prepare` · `After: a 2-minute decompression` and — when the pending window is a **repeat/indeterminate scan** — the **Waiting plan** (D-14):
> "Pick three rules, once, today: (1) a 15-minute daily worry window at a set time; (2) one real distraction block per day — a walk, a show, one errand; (3) one human to text instead of Googling — a nurse line counts. Write the worst-case fear down **once**, read it **once**, done. A pre-decided plan beats 'we'll figure it out if it's bad' — unknowns are where scanxiety lives."

**Beta #1 (9–11 dpt)**
- Happens: "A blood draw for a single hCG value. Some clinics run a day-7/8 preliminary; most don't."
- Tells: "Whether a number exists at all, roughly how it's tracking against a threshold — many clinics use about 50–100 mIU/mL as an encouraging starting point."
- Can't: "One number alone tells much less than the trend. A strong single beta doesn't rule out an ectopic, and a low first one doesn't doom anything."
- Prepare: "Eat normally; drink water as usual. Ask: 'will you draw again, and when — and when do you stop betas?'"
- After: "The number will come with a second one 48 hours later. Try writing both on one line and judging *the pair* — that's the honest unit of information."

**Beta #2 (48 h later)**
- Happens: "Repeat hCG. At low starting values, 'at least about a 53% rise in 48 h' is the well-validated minimum expectation; the required rise gets smaller at higher levels."
- Tells: "The trend, which is what actually matters at this stage."
- Can't: "It still can't reliably distinguish inside-the-uterus from outside — only ultrasound can. Slower-than-expected rises happen in ~1% of viable pregnancies."
- Prepare: "Same instructions as draw one. Ask: 'what level do we stop drawing and switch to scan?'"
- After: "If the numbers are slower than hoped — that is a 'we follow up' signal, not a verdict."

**First ultrasound (6w0d–6w6d typical)**
- Happens: "Transvaginal ultrasound, ~10 minutes. They look for the gestational sac, yolk sac, fetal pole, and cardiac activity — in that order; all four rarely appear at once at exactly 6w0d."
- Tells: "Location (inside vs outside the uterus), measurable growth, and whether a heartbeat is visible *yet*."
- Can't: "A single 6w scan often can't give a final answer. Thresholds are deliberately conservative — set so a healthy pregnancy is never accidentally declared failed. When something is 'suspicious but not diagnostic,' the standard is to rescan 7–14 days later. Indeterminate findings get followed, never declared."
- Prepare: "Come with a full-ish bladder if asked; plan for a partner — writing your top question down beats remembering it on the table. Ask your clinic: 'is there any preparation you want, and when is the follow-up scan if we need one?'"
- After (indeterminate = the waiting plan above +): "What the follow-up will look for: a cardiac flicker, growth between the two scans (a healthy CRL grows ~1 mm/day), and a yolk sac that behaves. 7–14 days' difference in this window is enormous measurable progress."
- After (all clear): "Sunset. Log one line for yourself on what you saw. Let someone bring dinner."

**Graduation (8–10, sometimes 8–12 w)**
- Happens: "Your RE closes out and your OB takes over. Records transfer, a last scan if scheduled, and the 'what carries forward' list — your med taper timing, any aspirin/Lovenox notes, your dating."
- Tells: "Everything, at that point — by 8–10 weeks a heartbeat is confirmed and this is a handoff, not a test."
- Can't: "It doesn't end your clinic relationship permanently — most REs stay reachable for questions; ask directly if so."
- Prepare: "Bring the 'My actual protocol' fill-in table — it's exactly what your OB wants to inherit. Ask: 'what week do I graduate, and what do you send the OB?'"
- After: "Some people feel oddly abandoned by the IVF clinic around now — that's a real, common feeling, not a malfunction. Your support loop transfers with you."

**NT ultrasound + combined screen (11w0d–13w6d)**
- Happens: "A specific ultrasound measuring a thin fluid layer behind the fetal neck (needs CRL 45–84 mm to be valid), often paired with the first-trimester blood draw at the same visit."
- Tells: "A combined screening figure for a handful of chromosomal conditions. It's a screen: it can flag, not diagnose."
- Can't: "It doesn't check anatomy broadly and can't read sex meaningfully. Results can also be 'borderline' — which leads to more conversation, not a conclusion."
- Prepare: "Full bladder per the office's instructions; expect 45 minutes. Ask: 'do you want both the NT and a blood screen, or NIPT instead, or both?'"
- After: "If numbers come back interesting, the next move is a conversation with your OB — not a self-Google."

**NIPT / cfDNA (from 10 w)**
- Happens: "One blood draw. Lab reads placental DNA fragments in your blood — not fetal blood — and reports on a set of chromosomal conditions and (optionally) sex chromosomes."
- Tells: "Screen-level detection: trisomy 21 >99%, 18 ~98%, 13 up to ~99% in some analyses; sex read from Y-DNA is right roughly 98–99% of the time when fetal fraction is adequate."
- Can't: "It's a screen, not a diagnostic; only CVS (~10–13 w) or amniocentesis (~15+ w) are. About 1–5% of first draws come back 'no-call' — most redraws succeed. A previous scan's vanishing twin or a prior male-organ transplant can also shift results."
- Prepare: "Ask: 'which NIPT panel, and what happens if the fetal fraction comes back low?'"
- After: "No-call isn't bad news. It's 'not enough sample from that draw' — a redraw usually clears it."

**Anatomy ultrasound (18–22 w)**
- Happens: "A 30–45-minute scan checking organs, growth, placenta position, and — for a boy — visibly identifying penis and scrotum. Testes will be described as inside the abdomen; that's fully expected at this stage and becomes normal descent only in the third trimester. Some fluid around the scrotum (hydrocele) is common and usually resolves on its own."
- Tells: "The structural check NIPT never does — and the confirmation of what NIPT said about sex."
- Can't: "It can't predict how labor goes or what he'll be like — and occasionally a detail needs a second look. Re-checking is routine; thousands of anatomy scans get one."
- Prepare: "Ask: 'full bladder or not, and should the support person come?' Wear a two-piece outfit; bring water."
- After: "Write down the one sentence you want to remember from this scan. Something about him being *specific* tends to stay."

---

## 4. Check-in

### 4.1 Daily log strings
- Title: "30-second check-in." Subhead: "Private. No verdicts. Yours."
- Rows: "Nausea" (0–10; slider label "0 = none"), "Fatigue" (0–10), "Spotting" (toggle), "Cramping" (toggle), "Slept okay" (toggle), "Anxiety right now" (0–10).
- Anxiety slider label (0 and 10 anchors): "0 — flat and fine" · "10 — can't function".

### 4.2 Severity follow-up (shown when spotting OR cramps toggled on)
**Header (neutral, not rose):** "You tapped {Spotting/Cramping} — one more screen, then we'll tell you what fits."

**Spotting branch:**
- Q1 "How much do you see?" (radio): "Spots when I wipe" · "Light flow, no pad needed" · "Soaking a pad in an hour or less" · "Clots, or gray/white tissue"
- Q2 "Are you dizzy, lightheaded, or did you faint?" (toggle)
- `[Continue]`

**Cramping branch:**
- Q1 "How bad is it?" (radio): "Mild — noticeable, easy to talk through" · "Moderate — distracting" · "Severe — hard to stand or think"
- Q2 "Mostly on one side?" (toggle)
- Q3 "Pain at your shoulder tip (where the shoulder meets the back)?" (toggle)
- Q4 "Dizzy, lightheaded, or did you faint?" (toggle)
- `[Continue]`

### 4.3 Tier cards — word for word
**Tier-1 spotting (light/flow, no dizziness):**
> **You logged spotting. Call the clinic — that's the rule, even for the light kind.**
> Most first-trimester bleeding isn't a bad sign — roughly 1 pregnancy in 5 sees some — but the clinic still wants every instance reported, and "light or brown" never grants a skip. Perspective: they've heard this call a hundred times; you won't be the dramatic one.
> No emoji here. Two verbs: `[Call clinic now]` `[Log & mention at next visit]`

**Tier-1 cramping (moderate, not one-sided, no shoulder-tip, no dizziness):**
> **You logged moderate cramping — a same-day clinic call fits.**
> Mild, on-and-off, both-sided, period-like cramping is normal uterine stretching. Moderate but not one-sided isn't the ectopic pattern — but "new or different" is worth a human ear today.
> `[Call clinic now]` `[Log & mention at next visit]`

**Tier-2 (open Safety modal, Tier 2 in view, 911/ER first):**
> Modal header: "Go now. This fits the emergency list."
> List (verbatim from clinical doc §4): "Heavy bleeding — soaking a full pad in an hour or less, or clots, or gray/white tissue." · "Severe or one-sided pain, or pain with a shoulder-tip ache." · "Fainting or near-fainting." · "Fever of 100.4°F / 38°C or higher with any other symptom." · "Can't keep fluids down for 24 hours, or can't pee normally." · "Chest pain, trouble breathing at rest, or coughing blood."
> Buttons in this order: `[Call 911]` `[Go to the nearest ER]` `[Call clinic (main)]` `[Call after hours]`.
> Sub-line: "Calling the clinic **and** heading to the ER at the same time is normal and good. Multiple symptoms at once = straight to the ER, not waiting on a callback."

**Tier-0 info (mild cramps, no oddities):**
> "Mild, both-sided, on-and-off cramping is common in this stretch — the uterus is stretching. Call if it changes character: worse, one-sided, or with any of the things on the emergency list."

### 4.4 Red-flag list (Safety modal, Tier 1 section copy)
"It's not an emergency — but these all get a call, and uncertainty *always* counts as a reason to call:"
- "Any spotting or bleeding, light or brown, once or ongoing."
- "New or different cramping; moderate pain."
- "Foul-smelling discharge, especially after any procedure."
- "Fever that stays up 24 h, any level."
- "Can keep fluids down but nothing else — food won't stay."
- "A calf that's suddenly warm, swollen, or painful on one side."
- "Anxiety you can't work, eat, or sleep through; scary intrusive thoughts."

### 4.5 Trend
- Title: "Trends." Subhead: "Neutral lines, no verdicts. These show what you typed — they don't say anything about the pregnancy."
- Sparkline labels: "nausea · fatigue · anxiety." CSS bars, no chart lib. Footnote: "Only 14 days stay visible — long history is intentionally off; this is a comfort tool, not a monitoring tool."

### 4.6 No-symptom counter-message (presents after a fully-clean save)
"Noted. Feeling quiet is allowed. If a long-standing symptom suddenly disappears, that's the one version of quiet worth a call."

### 4.7 Worry journal & grounding
- Journal title: "Worry journal." Prompt options: "Worst-case, written once." · "What am I afraid of?" · "What's the plan if it happens (even a bad plan calms this)."
- Worry window: "Set a 15-minute daily worry window." Copy under it: "Outside the window, postponed worries wait for the next one. The window is the plan — not suppression, just scheduling."
- Grounding scripts:
  - **Box breathing** (audio off; text countdown, animated circle unless reduced-motion): "In for 4. Hold 4. Out for 4. Hold 4. Again — four rounds. This calms your nervous system in a slightly boring but award-winning way."
  - **5-4-3-2-1 grounding:** "Name 5 things you can see. 4 you can touch. 3 you can hear. 2 you can smell. 1 you can taste. Ruminating hates a queue."

---

## 5. Little One — weeks 5–22, final copy (each: title · size · length · 2–3 developments · gentle focus · not-visible-yet caveats)

*(Format fixed: `Week {n} — {size} · {length}`. All lengths/developments/notes from clinical doc §6 table; size analogies approximate and labeled.)*

**Week 5 — Poppy seed · ~2 mm.** "The neural tube is closing; the heart is starting as a simple tube. Your embryo is genetically XY already — but at this size, there is no visible difference between boy and girl. Nothing to see; everything to build."
- Gentle focus: "Rest is productive this week."
- Not-visible-yet: "Nothing is scannable yet — first scans run from 6w0d."

**Week 6 — Lentil · ~4 mm.** "The heart starts beating — most often visible around 6w0d–6w3d on an early scan. Arm and leg buds appear. The gonad is still 'bi-potential' at this point, able to go either way."
- Boy note: "None visible — the Y chromosome is working, but the hardware hasn't differentiated."
- Gentle focus: "Book the scan date; that's the whole job."

**Week 7 — Blueberry · ~1 cm.** "The brain is growing fast; arm and leg paddles now."
- Boy note: "The milestone week: the SRY gene on the Y chromosome activates in the gonad during weeks 6–7 and points it toward becoming a testis. Sertoli cells begin forming."
- Gentle focus: "The first 12 weeks are the organ-building window — 'critical period' ends around 10 w."

**Week 8 — Raspberry · ~1.6 cm.** "Fingers and toes are beginning; movement starts (not felt yet by you)."
- Boy note: "The testis starts making its first testosterone — low, then ramping."
- Gentle focus: "Profound fatigue is normal and hormone-driven. Naps are a clinical intervention, not a weakness."

**Week 9 — Grape · ~2.3 cm.** "Essential organs have all begun forming. The tail is regressing."
- Boy note: "Testosterone is climbing toward its first-trimester peak (weeks ~8–12)."
- Gentle focus: "The 'why am I still on shots' feeling peaks around here — the taper question is a week-8-to-12 conversation, and the RE decides per your protocol."

**Week 10 — Kumquat · ~3.1 cm.** "Officially a fetus at the end of this week. Fingernails appear; kidneys begin making urine."
- Boy note: "Testosterone peaks around weeks 8–12 and drives the Wolffian ducts into epididymis, vas deferens, and seminal vesicles; DHT shapes external anatomy."
- Gentle focus: "This is the NIPT window opening (from 10 w). Ask the clinic which panel they use."

**Week 11 — Fig · ~4.1 cm.** "Head is about half the body — normal. Hearing structures are developing."
- Boy note: "Testosterone peaks then begins falling back; DHT turns the genital tubercle toward a penis and fuses the folds into a scrotum."
- Gentle focus: "The progesterone-taper emails from other apps are not your protocol. Yours is in weeks 10–12 territory, per your RE."

**Week 12 — Lime · ~5.4 cm.** "Liver and kidneys are functioning; the risk of miscarriage drops meaningfully once a heartbeat is confirmed and keeps falling with each week."
- Boy note + caveat: "External genitalia are largely formed by ~12–13 weeks — but *you cannot read sex from an ultrasound this week*. Not at any accurate level, and especially not via a 'nub' guess. NIPT is where 'boy' comes from right now; the 18–22-week anatomy scan is the confirmation."
- Gentle focus: "If relatives ask for a '12-week gender scan,' hand them NIPT's reliability instead."

**Week 13 — Peach · ~7.4 cm (CRL this week; charts switch to head-to-heel soon).** "Vocal cords are forming; the intestines finish moving back into the abdomen."
- Boy note: none this week.
- Gentle focus: "End of trimester one — tally it up honestly: what got you through, who helped, what to keep."

**Week 14 — Lemon · ~8.7 cm head-to-heel.** "Squinting, frowning, making grasping motions; facial muscles are working. Measurements switch from crown–rump to head-to-heel from here."
- Boy note: "Sex-differentiated external genitalia are usually visually identifiable on scan from ~14 w onward — but seeing it isn't the purpose of any scan you'll get."
- Gentle focus: "First-trimester growth is remarkably steady (GA in days ≈ crown–rump length in mm + 42). Known-stability facts help on edgy days."

**Week 15 — Apple · ~10.1 cm.** "Light comes through closed eyelids; the skeleton hardens from cartilage to bone."
- Gentle focus: "Normal bodily changes (aching back, growing appetite, round ligament-type twinges) start here — all standard."

**Week 16 — Avocado · ~11.6 cm.** "Hearing is developing (muffled); first movements may be felt soon — usually 17–20 w for first pregnancies."
- Gentle focus: "Book a telehealth or a brief check-in if a scan is still far ahead and quiet days are heavy."

**Week 17 — Pear · ~13 cm.** "Cartilage keeps turning to bone; practicing 'breathing' amniotic fluid."
- Gentle focus: "Second-trimester energy usually returns — spend it deliberately."

**Week 18 — Bell pepper · ~14.2 cm.** "Yawning, hiccuping; ears reach their anatomical position. The anatomy-scan window opens (18–22 w)."
- Boy note: "On the scan, you'll likely see penis and scrotum identified; the testes will be described as inside the abdomen — completely normal at this stage; descent completes in the third trimester, sometimes even after birth."
- Gentle focus: "Ask whether your clinic will do the anatomy scan at 18 or 20 — both are in-window."

**Week 19 — Mango · ~15.3 cm.** "Vernix (a waxy coating) is starting; hearing is sharper."
- Gentle focus: "A support person at the anatomy scan changes the experience — plan it now."

**Week 20 — Banana · ~16.4 cm.** "Halfway point. The anatomy scan often happens here."
- Boy note: "The standard second-trimester reading for a boy: visible male genitalia, intra-abdominal testes, occasionally some scrotal fluid (hydrocele) — all expected and usually self-resolving before or shortly after birth."
- Gentle focus: "If anything on the scan needs a second look, that's the norm for anatomy scans — thousands get re-checked without drama."

**Week 21 — Carrot · ~26.7 cm.** "Swallowing more amniotic fluid; rapid eye movements begin."
- Gentle focus: "Sleep on either side is fine — left-side optimization is a third-trimester thing."

**Week 22 — Papaya · ~27.8 cm (~11 in).** "Looks like a tiny newborn proportionally; sense of touch is well developed. Viability outside the womb becomes *possible* from ~22–24 w with intensive NICU support — a biologic fact, not a promise."
- Gentle focus: "If your clinic says you're past 22 w, the app now says: your OB is leading. 🎉"

### Loss-history variant (applies to every week card if `lossHistory: true` and not opted out via rainbow opt-in)
Footer note per card: "You're here at {w} weeks. The next check is {appNextVisitDate}. Between checks: one thing, that's it —this week's gentle focus *and, if it helps, one scan-partner text a day.*"

### Milestone celebration copy
| Trigger | Copy |
|---|---|
| Day-5 blast transferred | `"Transferred." A day-5 blast, on schedule. This is exactly the starting point a healthy pregnancy is meant to begin from.` |
| First beta (any value) | `"First number in." From here, the trend does the talking — that's exactly how your clinic is watching too.` |
| Heartbeat confirmed | `"First heartbeat, on screen." This is the moment the ultrasound takes over from the betas — intended that way, not a lucky break.` |
| Graduated to OB | `"You graduated." Your RE handed you to your OB with all your notes — your clinic relationship doesn't end; the lead role changes.` |
| Testosterone ramp (unlocks at 8w) | `"Testosterone ramping." A quietly boy-specific week — 8 to 12 weeks, hormones doing sex-differentiation work. The baby never notices.` |
| Anatomy scan confirmed | `"Anatomy scan confirmed." Both a structural check and a 'male' confirmation — the thing NIPT pointed at, verified.` |

---

## 6. Learn / FAQ (12, ≤120 words each)

1. **Is spotting normal after IVF?**
About 20–30% of pregnancies have some first-trimester bleeding. IVF adds implantation and medication-related spotting to the mix. Most bleeding doesn't mean the pregnancy is failing. But the clinic wants a call for *any* spotting — light or brown — every time. That rule isn't scaremongering: it's how clinics catch the serious causes early while routinely reassuring on the common ones. Soaking a pad in an hour, passing clots or tissue, or feeling dizzy → that's the ER list, now, not tomorrow.
**Call your clinic if…** you see any blood at all — the "harmless-looking" kind included.

2. **Are mild cramps normal?**
Mild, on-and-off, both-sided, period-like cramping is common from the uterus stretching. Severe pain, one-sided pain, or pain with a shoulder-tip ache is not — that pattern is the ER list. Moderate-but-not-one-sided pain gets a same-day call. Dizziness or fainting with any of it → ER. Nothing here is about how much you can "tolerate" — it's a plain pattern map.
**Call your clinic if…** the cramps are new-or-different, moderately bad, or you just can't tell — uncertainty counts.

3. **What if I have no symptoms at all?**
Symptoms do not read the pregnancy. Around 70–80% of pregnant people get nausea, which leaves 20–30% who don't — and healthy pregnancies land on both sides. Absence of nausea is not a sign of loss. The one asymmetry worth knowing: a long-established symptom *suddenly going silent* is worth a phone call, not an ER trip. Either way, don't track "am I still nauseous?" as a health metric. That door is closed on purpose.
**Call your clinic if…** an established symptom vanished abruptly and you can't set it down.

4. **When do I stop progesterone?**
Most clinics stop or taper between 8–12 weeks, once the placenta has taken over. Some taper (alternate days, or half dose, then stop); some stop outright; vaginal progesterone sometimes runs a bit longer than PIO. There are legitimate differences and high-risk exceptions that go longer. Stopping is always the RE's decision — it's timed to *your* protocol, and it's never a do-it-yourself taper. After a stop, light cramping or spotting can occur from the withdrawal — expected, and always report any bleeding anyway.
**Call your clinic if…** you're within a week of your set stop date and haven't confirmed the plan.

5. **What does a beta number actually mean?**
hCG roughly doubles every 48–72 h very early on, then the pace naturally slows. Minimum expected rise in 48 h depends on the starting level: about 53% when low, ~49% under 1,500, ~40% from 1,500–3,000, ~33% above 3,000. Past ~6,000–10,000, doubling time stops being meaningful and ultrasound takes over. A single number can't distinguish inside- from outside-the-uterus, and a great single beta doesn't rule anything out — the trend is the unit of information.
**Call your clinic if…** a result confuses you — reading it out loud to a nurse is cheaper than Googling it.

6. **When is my first scan, and what if there's no heartbeat yet?**
Typically 6w0d–6w6d, sometimes later. They look for the sac, yolk sac, fetal pole, and cardiac activity — in that order. The thresholds are deliberately conservative: a CRL of ≥7 mm with no heartbeat, or a mean sac of ≥25 mm with no embryo, are diagnostic; anything *smaller*-and-quiet is "suspicious," which means a rescan in 7–14 days — that's the designed plan, not a limbo. The thresholds were set specifically so a healthy pregnancy is never mistakenly called a failure.
**Call your clinic if…** the appointment was 'indeterminate' and no follow-up scan got scheduled.

7. **Is it definitely a boy? When will I see it?**
NIPT looks for Y-chromosome DNA fragments from the placenta. From 10 weeks with adequate fetal fraction, the "male" call is right roughly 98–99% of the time — excellent, but still a screen, not a certainty. First-trimester ultrasound cannot reliably distinguish genitalia, and a "12-week nub" guess isn't a method. The 18–22-week anatomy scan is the visual confirmation, and it's the same scan that checks all the organs.
**Call your clinic if…** you want to know what a specific NIPT phrasing on your report means.

8. **What does the anatomy scan check for a boy?**
Two things: normal anatomy everywhere, and—confirming what the NIPT said—penis and scrotum, visibly. Two boy-specific findings that sound alarming and aren't: testes inside the abdomen at 18–22 weeks (they normally descend in the third trimester, sometimes even after birth), and a little scrotal fluid (hydrocele), which usually resolves on its own before or shortly after birth. Your sonographer may note either; both are in-normal-range findings.
**Call your clinic if…** the report words confuse you — the exact phrasing matters, and your OB reads it in context.

9. **How does the RE-to-OB handoff work — and why do I feel dumped?**
Graduation is typically 8–10 (sometimes 8–12) weeks, once the heartbeat is confirmed, often on two scans. It's a records handoff: a last scan, the med-taper plan, your dating. Your RE doesn't disappear — many stay reachable; ask. The "abandoned" feeling after graduation is a real, common thing among pregnancy-after-IVF patients. It has nothing to do with the quality of either clinic; it's the end of a very supported period, and the new support structure just hasn't warmed up yet.
**Call your clinic if…** graduation is close and nobody's told you what week it is or what gets sent.

10. **Do I need pelvic rest, and until when?**
Pelvic rest means nothing in the vagina — no intercourse, no vaginal suppositories or tampons — and for many protocols no orgasm at all (contractions are the concern, not just penetration). It's *not* universally required after IVF. Clinics prescribe it variously: none after the transfer week, 1–2 weeks until a heartbeat, or "until bleeding resolves." The only honest source is your RE. Bladder pressure, non-sexual daily activity, and household stress are not pelvic-rest issues.
**Call your clinic if…** you're not sure whether you're on it — ask, don't guess either direction.

11. **What can't I eat or drink? What's my caffeine limit?**
Avoid: unpasteurized anything and soft cheeses from unpasteurized milk; deli/cold cuts and hot dogs unless reheated to steaming; refrigerated pâté and smoked fish unless cooked into a dish; raw sprouts even home-grown; runny eggs and raw dough; raw/rare meat; liver and high-dose vitamin A skincare/supplements; shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, orange roughy; all herbal supplements before clearing them; alcohol — zero is the safe amount. Limit albacore tuna to ~6 oz a week; best fish picks (2–3 servings/wk): salmon, sardines, shrimp, tilapia, pollock, catfish, light tuna. Caffeine: ≤200 mg/day — roughly one 12-oz coffee; watch tea, cola, chocolate, matcha, energy drinks.
**Call your clinic if…** you're mid-consumption and worried — realistically: it's a question for the next visit, not an emergency.

12. **Is my anxiety "too much," and what do I do at 2 a.m.?**
Roughly 1 in 5 pregnant women hit clinically significant anxiety, and IVF patients start higher. It isn't a character flaw; it's a physiologically loaded condition with real treatment options — CBT-based therapy has the best evidence, and medication is a genuine option for many. Panic, inability to function, or scary intrusive thoughts are medical events, not personality notes. The 988 lifeline serves pregnant people too. At 2 a.m.: open Safety (1 tap), text your scan partner, write the worst-case once, and pick tomorrow's one worry-window slot. Apps don't replace people; they shrink the search space.
**Call your clinic if…** you're unable to work, eat, or sleep because of it — that's a same-day conversation, not a white-knuckle one.

---

## 7. Settings

- **Transfer date** — helper: "EDD auto-calculates: transfer + 261 days." Changing it recomputes every date on every screen.
- **Clinic phone** — "Main line" · "After-hours line (optional)" · "Clinic hours" (days / start / end; default Mon–Fri 9–5).
- **Partner / support person (optional)** — "Name, who they are, phone." Used only by the "Send update" template (§ below); nothing shares automatically.
- **Med schedule editor** — "The dose, route, and time your clinic gave you — the app follows, it doesn't prescribe." Stop week blank by default: "Leave blank until your RE names a week."
- **Notification prefs** — "Meds reminder" / "Refill reminder" on/off (both default on; both described as best-effort, not guaranteed).
- **Dark mode** — Light · Dark · Follow system. "Off by default" is the shipped default; line under toggle: "Dark mode helps at 2 a.m.; deliberately calm either way."
- **Celebrations** — on/off, "Quiet wins."

**Export / Import**
- Export button: `[Copy my data to clipboard]` — shows a textarea of the JSON and a confirm toast "Copied. Paste it anywhere — Notes, an email to yourself."
- Import: paste into a textarea → `[Preview]` shows schemaVersion, transfer date, med count → `[Restore this]` requires a confirm.
- Invalid import: "That doesn't look like an export. Copy the whole JSON block — starting with `{` and ending with `}`."
- One calm line above both: "Two taps of insurance: if this file ever gets opened in a way that forgets your data, an export puts it back."

**Data reset** — "Type RESET to erase everything on this device." → confirm screen: "Gone means gone — there's no server holding a copy. Export first if you might want it back." `[Erase]` `[Keep my data]`

---

## 8. Error / toast / empty states (every screen)

| Screen | Empty | Error |
|---|---|---|
| Today | "No transfer date yet — 30 seconds makes this real." `[Set date]` `[Explore demo]` | storage-failure banner (§0.1) |
| Focus fallback | "Nothing needs you right now." | — |
| Meds | "No meds yet." `[Add in Settings]` | a med row with invalid time → amber inline "Check the time field — it needs a clock time." |
| Refill block | "No meds set yet." | negative or absurd counts clamp with "Count looks off — edit days-on-hand in Settings." |
| Check-in | "First check-in — takes 30 seconds." | severity follow-up can't be skipped silently when a row is toggled: "Answer the follow-up question, or untap the symptom to log it ungraded." |
| Trend | "Two logged days light this up." | — |
| Worry journal | "First worry. It's okay to put it down." | — |
| Little One | before 4w0d: "A few days from week 4 — the week cards open then." | past 22w: "Your OB is leading now." |
| Appointments | "No appointments yet — put the first scan on the calendar." | date in past, status 'scheduled': label shifts to "Was this today? Update it." |
| Safety modal | "No numbers saved yet — they live in Settings." | — |
| Import | — | see §7 |
| Toasts | — | storage failure = persistent one-line banner; export success "Copied."; import success "Restored — {n} entries back."; import failure inline, non-modal. |

---

## 9. Print handout — headings (print stylesheet expands all `<details>`, keeps `[VERIFY LOCALLY]`, page-breaks per zone)

```
PAGE 1 — COVER
  My IVF Pregnancy Handout
  Transfer {date} · Day-5 blastocyst · {ga} as of {date} · EDD {edd}
  Compiled from ACOG/ASRM/SMFM/CDC/FDA/NIH/NICE/WHO public guidance; my clinic's plan overrides every number here.

PAGE 2 — MY PROTOCOL (the clinical doc's "My actual protocol" table, blank lines for the clinic to fill)
PAGE 3 — MEDICATIONS & REFILL STATUS
PAGE 4 — APPOINTMENTS WHAT/HAPPENS/CAN'T-TELL-YET (all six cards, condensed)
PAGE 5 — RED FLAGS: the two-tier card, verbatim, with phone trio
PAGE 6 — QUESTIONS I'M BRINGING (from worry journal + FAQ callouts + graduation-unset card)
PAGE 7 — DATA PRIVACY & SOURCES
```

---

## 10. Send-update template (partner support, optional, copy-only)
Button: `[Copy an update to send]` (on the Today screen when a support person is set; after appointments too)
```
{partnerName},
Today at a glance: {ga}, due {edd}.
Meds today: {taken/toward-done/none-due-}.
Anything notable: {symptom-or-"nothing unusual"}.
Next: {next appointment, date}.
Mood: {anxiety n}/10 — your call is always welcome; no action needed.
```

---

*End of deck. Every string here is final and should be shipped as written; any future edit runs the tone rules and the [VERIFY LOCALLY] audit again.*
