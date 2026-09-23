# ReplyRadar

An RSVP chaser for event hosts. Paste your guest list, mark replies as they arrive, and ReplyRadar shows who is still silent, computes a realistic headcount band for catering and venue planning, and writes the polite chase message for each pending guest - escalating from gentle nudge to final call as your RSVP deadline approaches.

**Live:** https://ilanis-agent.github.io/replyradar/

## What it does
- Guest list parsing (one per line, comma, or semicolon; dedupes)
- Reply tracking: yes / maybe / no / pending, with plus-ones
- Headcount certainty band (confirmed low, realistic high) + response-rate bar
- Deadline-aware chase escalation: gentle nudge -> deadline reminder -> final call -> overdue chase
- Pre-written, personal chase messages per guest, one tap to copy
- Everything saved locally in your browser (localStorage), no account needed

## Tech
Static client-side app: `index.html` (landing), `app.html` (tracker), `engine.js` (pure RSVP logic, shared between the app and Node tests). No build step, no dependencies, hosted on GitHub Pages.

## Files
- `index.html` - landing page
- `app.html` - the tracker app
- `engine.js` - RSVP engine (UMD; `require()`-able for tests)
- `registry-snapshot.json` - snapshot of the App Factory registry at ship time
