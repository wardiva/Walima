/**
 * Walima RSVP → your Google Sheet + an email to you.
 *
 * The invitation posts each reply here. This script adds it as a row to the
 * Google Sheet it belongs to (tab "RSVPs") and emails the Google account that
 * deployed it, so no email address is written anywhere in the website.
 *
 * Setup (also in the README, "RSVP replies"):
 *   1. Create a Google Sheet (e.g. "Walima RSVPs") in your Google account.
 *   2. Extensions → Apps Script. Delete what's there, paste this whole file, Save.
 *   3. Run "sendTestRsvp" once (pick it next to ▷ Run) and allow the permissions.
 *      You get a test row and a test email.
 *   4. Deploy → New deployment → type "Web app".
 *      Execute as: Me.  Who has access: Anyone.  Deploy.
 *   5. Copy the Web app URL (ends in /exec) into rsvp.endpoint in site/content.js.
 *
 * If you edit this script later: Deploy → Manage deployments → ✎ → Version:
 * "New version" → Deploy (the URL stays the same).
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Received', 'Answer', 'Name', 'Guests', 'Note', 'Sent (guest clock)', 'Time zone', 'Device'];
const ATTEND = 'Will attend';
const DECLINE = "Can't attend";

/** The invitation sends replies here (POST, JSON as text/plain). */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // two guests replying at the same moment
  try {
    let data;
    try {
      data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    } catch (err) {
      return json_({ ok: false, error: 'Not JSON' });
    }
    if (data.website) return json_({ ok: true }); // the hidden field: a bot
    const reply = record_(data);
    if (!reply) return json_({ ok: false, error: 'Name missing' });
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the /exec URL in a browser just says it's running. */
function doGet() {
  return ContentService.createTextOutput('The Walima RSVP endpoint is running.');
}

/** Run this once from the editor: it asks for permission, then adds a test row and emails you. */
function sendTestRsvp() {
  record_({
    answer: 'yes', name: 'Test Guest (you can delete this row)', guests: 2,
    message: 'Testing the RSVP setup', event: 'Walima of Hamza & Komal',
    sentAt: new Date().toISOString(), timeZone: Session.getScriptTimeZone(), userAgent: 'Apps Script test',
  });
}

/* ───────────────────────── internals ───────────────────────── */

function record_(data) {
  const answer = data.answer === 'no' ? 'no' : 'yes';
  const name = clean_(data.name, 80);
  if (!name) return null;
  const guests = answer === 'yes' ? Math.max(1, Math.min(20, parseInt(data.guests, 10) || 1)) : 0;
  const note = clean_(data.message, 300);

  const sheet = sheet_();
  sheet.appendRow([
    new Date(),
    answer === 'yes' ? ATTEND : DECLINE,
    safe_(name),
    guests,
    safe_(note),
    safe_(clean_(data.sentAt, 40)),
    safe_(clean_(data.timeZone, 60)),
    safe_(clean_(data.userAgent, 200)),
  ]);

  notify_({ answer, name, guests, note, event: clean_(data.event, 120) }, sheet);
  return { answer, name, guests };
}

function sheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME, 0);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#dde8eb');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('ddd d mmm yyyy, h:mm am/pm');
  }
  return sheet;
}

/** Totals by each guest's latest reply (someone who changes their reply counts once). */
function totals_(sheet) {
  const last = sheet.getLastRow();
  const latest = {};
  if (last > 1) {
    sheet.getRange(2, 2, last - 1, 3).getValues().forEach(function (r) {
      const key = String(r[1]).trim().toLowerCase();
      if (key) latest[key] = { answer: r[0], guests: Number(r[2]) || 0 };
    });
  }
  let attending = 0, guests = 0, declined = 0;
  Object.keys(latest).forEach(function (k) {
    if (latest[k].answer === ATTEND) { attending++; guests += latest[k].guests; } else declined++;
  });
  return { attending: attending, guests: guests, declined: declined };
}

function notify_(r, sheet) {
  const to = Session.getEffectiveUser().getEmail(); // the account that deployed the script
  if (!to) return;
  const yes = r.answer === 'yes';
  const people = r.guests === 1 ? '1 guest' : r.guests + ' guests';
  const subject = yes ? 'RSVP: ' + r.name + ' will attend (' + people + ')' : 'RSVP: ' + r.name + " can't attend";
  const t = totals_(sheet);
  const url = sheet.getParent().getUrl();
  const so_far = 'So far: ' + t.guests + (t.guests === 1 ? ' guest' : ' guests') + ' attending (' + t.attending +
    (t.attending === 1 ? ' reply' : ' replies') + '), ' + t.declined + " can't attend.";

  const body = [
    subject.replace('RSVP: ', ''),
    r.note ? 'Note: "' + r.note + '"' : '',
    '',
    so_far,
    'All replies: ' + url,
  ].filter(function (l, i) { return l || i === 2; }).join('\n');

  const h = esc_;
  const htmlBody =
    '<div style="font-family:Georgia,serif;color:#45302a;max-width:520px;margin:auto;padding:24px;background:#f6f8f8;border-radius:16px;border:1px solid #e2c98f">' +
    '<div style="font:600 12px/1.4 Arial,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#6e1f2a">' + h(r.event || 'Walima RSVP') + '</div>' +
    '<h1 style="font-weight:400;font-size:26px;margin:10px 0 4px;color:#1f2a44">' + h(r.name) + '</h1>' +
    '<p style="font-size:18px;margin:0 0 14px;color:' + (yes ? '#2c3a5c' : '#6e1f2a') + '">' +
    (yes ? '&#10004; Will attend &middot; <b>' + h(people) + '</b>' : 'Can’t attend') + '</p>' +
    (r.note ? '<blockquote style="margin:0 0 16px;padding:10px 14px;background:#fff;border-left:3px solid #b08a4f;font-style:italic">' + h(r.note) + '</blockquote>' : '') +
    '<p style="font:14px/1.5 Arial,sans-serif;color:#5a4339;margin:0 0 6px">' + h(so_far) + '</p>' +
    '<p style="font:14px/1.5 Arial,sans-serif;margin:0"><a href="' + h(url) + '" style="color:#5f7a90">Open the RSVP sheet</a></p>' +
    '</div>';

  MailApp.sendEmail({ to: to, subject: subject, body: body, htmlBody: htmlBody, name: 'Walima RSVP' });
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** A cell that starts with = + - @ would run as a formula: keep it as text. */
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
