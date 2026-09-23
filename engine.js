// ReplyRadar engine - RSVP tracking and chase-message logic (no DOM)
(function (root) {
  'use strict';

  var STATUSES = ['pending', 'yes', 'maybe', 'no'];

  function firstName(full) {
    return String(full).trim().split(/\s+/)[0] || 'there';
  }

  // Parse pasted guest list: one per line, or comma/semicolon separated.
  function parseGuestList(text) {
    var parts = String(text).split(/[\n;,]+/);
    var out = [], seen = {};
    parts.forEach(function (p) {
      var n = p.trim().replace(/\s+/g, ' ');
      if (!n) return;
      var key = n.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push(n);
    });
    return out;
  }

  function makeGuest(name, i) {
    return { id: 'g' + i + '_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: name, status: 'pending', plusOnes: 0, invitedDaysAgo: 0 };
  }

  // Headcount math: yes counts 1 + plusOnes; maybe counts expected-attend rate.
  function stats(guests, maybeRate) {
    if (maybeRate == null) maybeRate = 0.5;
    var s = { total: guests.length, pending: 0, yes: 0, maybe: 0, no: 0, confirmed: 0, expected: 0 };
    guests.forEach(function (g) {
      s[g.status]++;
      if (g.status === 'yes') s.confirmed += 1 + (g.plusOnes || 0);
      if (g.status === 'maybe') s.expected += maybeRate * (1 + (g.plusOnes || 0));
    });
    s.expected = Math.round((s.confirmed + s.expected) * 10) / 10;
    s.replied = s.yes + s.maybe + s.no;
    s.responseRate = s.total ? Math.round(100 * s.replied / s.total) : 0;
    return s;
  }

  function daysBetween(a, b) {
    var x = new Date(a.getTime()); x.setHours(0,0,0,0);
    var y = new Date(b.getTime()); y.setHours(0,0,0,0);
    return Math.round((y - x) / 86400000);
  }

  // Chase escalation for a pending guest. Stages: ok (no chase), gentle, deadline, final, late.
  function chaseStage(guest, rsvpByDaysOut, eventDaysOut) {
    if (guest.status !== 'pending') return 'ok';
    var waited = guest.invitedDaysAgo || 0;
    if (rsvpByDaysOut < 0) return 'late';          // past RSVP deadline, still silent
    if (rsvpByDaysOut <= 3) return 'final';
    if (rsvpByDaysOut <= 7) return 'deadline';
    if (waited >= 5 || eventDaysOut <= 21) return 'gentle';
    return 'ok';
  }

  var CHASE_LABELS = { ok: 'No chase needed', gentle: 'Gentle nudge', deadline: 'Deadline reminder', final: 'Final call', late: 'Overdue chase' };

  function chaseMessage(guest, eventName, stage, rsvpByDaysOut) {
    var n = firstName(guest.name);
    var ev = eventName || 'the event';
    switch (stage) {
      case 'gentle':
        return 'Hi ' + n + '! Quick nudge about ' + ev + ' - would love to know if you can make it. No rush, just excited to see you there!';
      case 'deadline':
        return 'Hi ' + n + '! Just a heads up that RSVPs for ' + ev + ' close in about ' + rsvpByDaysOut + ' days. Can you let me know either way? Thanks!';
      case 'final':
        return 'Hi ' + n + '! Final call for ' + ev + ' - I need to give the venue a headcount in ' + rsvpByDaysOut + ' day' + (rsvpByDaysOut === 1 ? '' : 's') + '. A quick yes or no would be amazing!';
      case 'late':
        return 'Hi ' + n + '! I\'m locking in numbers for ' + ev + ' today and don\'t have your RSVP yet. Should I count you in or out? Totally fine either way!';
      default:
        return '';
    }
  }

  // Catering certainty band: low = confirmed, high = confirmed + maybes + share of pendings by base rate.
  function headcountBand(guests, maybeRate, pendingRate) {
    if (maybeRate == null) maybeRate = 0.5;
    if (pendingRate == null) pendingRate = 0.3;
    var low = 0, high = 0;
    guests.forEach(function (g) {
      var party = 1 + (g.plusOnes || 0);
      if (g.status === 'yes') { low += party; high += party; }
      else if (g.status === 'maybe') { high += party; }
      else if (g.status === 'pending') { high += party * pendingRate; }
    });
    return { low: Math.round(low), high: Math.round(high) };
  }

  var api = {
    STATUSES: STATUSES,
    firstName: firstName,
    parseGuestList: parseGuestList,
    makeGuest: makeGuest,
    stats: stats,
    daysBetween: daysBetween,
    chaseStage: chaseStage,
    chaseMessage: chaseMessage,
    CHASE_LABELS: CHASE_LABELS,
    headcountBand: headcountBand
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ReplyEngine = api;
})(typeof self !== 'undefined' ? self : this);
