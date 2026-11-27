import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
export const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
let ready;
export function init() {
  if (!ready) ready = (async () => {
    await db.batch([
      `CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password_hash TEXT, name TEXT, role TEXT, class_name TEXT, phone TEXT)`,
      `CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY AUTOINCREMENT, roll_no TEXT UNIQUE, name TEXT, father_name TEXT, class_name TEXT, dob TEXT, parent_phone TEXT, fee_due INTEGER DEFAULT 0)`,
      `CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, father_name TEXT, phone TEXT, class_name TEXT, created_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS attendance(student_id INTEGER, date TEXT, status TEXT, UNIQUE(student_id,date))`,
      `CREATE TABLE IF NOT EXISTS results(student_id INTEGER, exam TEXT, subject TEXT, marks REAL, max_marks REAL, UNIQUE(student_id,exam,subject))`,
      `CREATE TABLE IF NOT EXISTS notices(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, created_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT)`,
    ], 'write');
    const n = await db.execute('SELECT COUNT(*) n FROM users');
    if (Number(n.rows[0].n) === 0 && process.env.PRINCIPAL_INIT_PASSWORD)
      await db.execute({ sql: 'INSERT INTO users(username,password_hash,name,role) VALUES(?,?,?,?)', args: ['principal', bcrypt.hashSync(process.env.PRINCIPAL_INIT_PASSWORD, 10), 'Principal', 'principal'] });
  })();
  return ready;
}
export const setSetting = (k, v) => db.execute({ sql: 'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', args: [k, String(v)] });
export async function upsertStudents(list) {
  const rows = list.filter(s => s.roll_no && s.name).map(s => ({
    sql: `INSERT INTO students(roll_no,name,father_name,class_name,dob,parent_phone,fee_due) VALUES(?,?,?,?,?,?,?) ON CONFLICT(roll_no) DO UPDATE SET name=excluded.name,father_name=excluded.father_name,class_name=excluded.class_name,dob=excluded.dob,parent_phone=excluded.parent_phone,fee_due=excluded.fee_due`,
    args: [String(s.roll_no).trim(), String(s.name).trim(), s.father_name || '', s.class_name || '', s.dob || '', String(s.parent_phone || '').replace(/\D/g, '').slice(-10), Number(s.fee_due) || 0] }));
  if (rows.length) await db.batch(rows, 'write');
  return rows.length;
}
