import { google } from 'googleapis';
function client() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_SHEET_ID) return null;
  const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON), scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return google.sheets({ version: 'v4', auth });
}
const id = () => process.env.GOOGLE_SHEET_ID;
// Sheet needs tabs named "Leads" and "Students"
export async function appendRow(tab, row) {
  try { const s = client(); if (!s) return false;
    await s.spreadsheets.values.append({ spreadsheetId: id(), range: `${tab}!A1`, valueInputOption: 'USER_ENTERED', requestBody: { values: [row] } }); return true;
  } catch (e) { console.error('sheet append', e.message); return false; }
}
export async function readRows(tab) {
  const s = client(); if (!s) throw new Error('Google Sheets not configured');
  const r = await s.spreadsheets.values.get({ spreadsheetId: id(), range: `${tab}!A2:Z` });
  return r.data.values || [];
}
export async function writeAll(tab, header, rows) {
  const s = client(); if (!s) throw new Error('Google Sheets not configured');
  await s.spreadsheets.values.clear({ spreadsheetId: id(), range: `${tab}!A:Z` });
  await s.spreadsheets.values.update({ spreadsheetId: id(), range: `${tab}!A1`, valueInputOption: 'USER_ENTERED', requestBody: { values: [header, ...rows] } });
}
