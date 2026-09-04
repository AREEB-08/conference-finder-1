/**
 * Conference Finder — Google Apps Script data endpoint
 * ----------------------------------------------------
 * Serves both tabs of this spreadsheet as JSON.
 *
 *   ?sheet=conferences  ->  { success: true, conferences: [ ... ] }
 *   ?sheet=journals     ->  { success: true, journals:    [ ... ] }
 *
 * SETUP
 *   1. Open your spreadsheet, then Extensions > Apps Script.
 *   2. Delete whatever is there and paste this whole file in.
 *   3. Adjust CONFERENCES_TAB / JOURNALS_TAB below if your tabs are named
 *      something other than Sheet1 and Sheet2.
 *   4. Deploy > New deployment > type "Web app".
 *        Execute as:       Me
 *        Who has access:   Anyone
 *   5. Copy the /exec URL into GOOGLE_SHEETS_API_URL in .env.local.
 *
 * Re-deploy (Deploy > Manage deployments > edit > Version: New) after any edit,
 * or the old code keeps serving.
 */

var CONFERENCES_TAB = 'Sheet1';
var JOURNALS_TAB = 'Sheet2';

function doGet(e) {
  try {
    var which = (e && e.parameter && e.parameter.sheet) || 'conferences';
    var isJournals = which === 'journals';
    var tabName = isJournals ? JOURNALS_TAB : CONFERENCES_TAB;

    var rows = readTab(tabName);

    var payload = { success: true, count: rows.length };
    payload[isJournals ? 'journals' : 'conferences'] = rows;

    return json(payload);
  } catch (err) {
    // Never echo internal details; the site shows a generic message anyway.
    return json({ success: false, error: 'Could not read the spreadsheet.' });
  }
}

function readTab(tabName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  if (!sheet) return [];

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0].map(function (h) {
    return String(h == null ? '' : h).trim();
  });

  var timezone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  var out = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var record = {};
    var hasContent = false;

    for (var c = 0; c < headers.length; c++) {
      var header = headers[c];
      if (!header) continue;

      var value = row[c];

      if (value instanceof Date) {
        // Format in the SPREADSHEET's timezone. Letting a Date serialise to
        // JSON gives UTC, which shifts an IST date back by one day.
        value = Utilities.formatDate(value, timezone, 'yyyy-MM-dd');
      } else if (value == null) {
        value = '';
      } else if (typeof value !== 'number' && typeof value !== 'boolean') {
        value = String(value).trim();
      }

      record[header] = value;
      if (String(value).length > 0) hasContent = true;
    }

    // Skip rows that are entirely blank.
    if (hasContent) out.push(record);
  }

  return out;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
