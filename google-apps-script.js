/**
 * Google Apps Script - Paseo Lead Form Integration
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1e1kjrD8fLioHG4L-nUjqY0uSyx6xsvoTpMq0uaij5iY
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy" and authorize when prompted
 * 9. Copy the Web App URL
 * 10. In index.html, replace 'REPLACE_WITH_YOUR_GOOGLE_SCRIPT_URL' with the URL
 *
 * SHEET STRUCTURE (Row 1 headers - will be auto-created):
 * A: תאריך ושעה | B: שם מלא | C: טלפון | D: אימייל | E: סוג אירוע
 * F: כמות אורחים | G: תאריך אירוע | H: הערות | I: מקור | J: דף
 */

const SHEET_NAME = 'לידים';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'תאריך ושעה',
        'שם מלא',
        'טלפון',
        'אימייל',
        'סוג אירוע',
        'כמות אורחים',
        'תאריך אירוע',
        'הערות',
        'מקור',
        'דף',
        'סטטוס'
      ]);
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, 11);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#2a8a78');
      headerRange.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      // Set column widths
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(2, 140);
      sheet.setColumnWidth(3, 130);
      sheet.setColumnWidth(4, 180);
      sheet.setColumnWidth(5, 120);
      sheet.setColumnWidth(6, 110);
      sheet.setColumnWidth(7, 120);
      sheet.setColumnWidth(8, 250);
      sheet.setColumnWidth(9, 140);
      sheet.setColumnWidth(10, 200);
      sheet.setColumnWidth(11, 100);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('he-IL'),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.eventType || '',
      data.guests || '',
      data.date || '',
      data.notes || '',
      data.source || '',
      data.page || '',
      'חדש'
    ]);

    // Send email notification (optional - uncomment and set your email)
    // sendNotificationEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Paseo Lead API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional: Email notification on new lead
 * Uncomment the call in doPost() and set your email below
 */
function sendNotificationEmail(data) {
  const email = 'YOUR_EMAIL@gmail.com'; // <-- Change this
  const subject = 'ליד חדש מ-' + (data.source || 'האתר') + ' - ' + data.name;
  const body = [
    'ליד חדש התקבל!',
    '',
    'שם: ' + data.name,
    'טלפון: ' + data.phone,
    'אימייל: ' + (data.email || '-'),
    'סוג אירוע: ' + (data.eventType || '-'),
    'כמות אורחים: ' + (data.guests || '-'),
    'תאריך: ' + (data.date || '-'),
    'הערות: ' + (data.notes || '-'),
    'מקור: ' + (data.source || '-'),
    '',
    'צפו בגיליון: https://docs.google.com/spreadsheets/d/1e1kjrD8fLioHG4L-nUjqY0uSyx6xsvoTpMq0uaij5iY'
  ].join('\n');

  MailApp.sendEmail(email, subject, body);
}

/**
 * INTEGRATION GUIDE - Connecting All 5 Lead Sources
 * ==================================================
 *
 * 1. WEBSITE (paseo-events / paseo.co.il)
 *    Already done! The form sends directly to this sheet.
 *    Source tag: "אתר - paseo-events"
 *
 * 2. INSTAGRAM + FACEBOOK (via Mike's integration)
 *    Already connected to Google Sheets.
 *    Option A: Point Mike's integration to this same sheet
 *    Option B: Use Google Sheets IMPORTRANGE to pull data from Mike's sheet:
 *      =IMPORTRANGE("MIKE_SHEET_URL", "Sheet1!A:Z")
 *
 * 3. CALL EVENT
 *    Option A: If Call Event supports webhooks, point it to this script's URL
 *    Option B: Use Zapier/Make.com:
 *      Trigger: New lead in Call Event
 *      Action: Add row to Google Sheets (this sheet, 'לידים' tab)
 *    Source tag: "Call Event"
 *
 * 4. PHONE CALLS FROM HOSTESS (WhatsApp group)
 *    Option A: Create a simple Google Form linked to this sheet
 *      - The hostess fills it after each call (30 seconds)
 *      - Fields: name, phone, event type, notes
 *      - Auto-tags source as "טלפון - מארחת"
 *    Option B: Use a WhatsApp bot (like Twilio) to parse messages
 *      from the "פסאו לידים" group and add to sheet
 *
 * 5. UTM TRACKING FOR ADS
 *    Add UTM parameters to your ad links:
 *    - Facebook ads:  https://paseo-events.vercel.app?utm_source=facebook&utm_medium=ad&utm_campaign=CAMPAIGN_NAME
 *    - Instagram ads: https://paseo-events.vercel.app?utm_source=instagram&utm_medium=ad&utm_campaign=CAMPAIGN_NAME
 *    - Google ads:    https://paseo-events.vercel.app?utm_source=google&utm_medium=cpc&utm_campaign=CAMPAIGN_NAME
 *    - Call Event:    https://paseo-events.vercel.app?utm_source=callevent
 *    The form automatically detects and records the source.
 */
