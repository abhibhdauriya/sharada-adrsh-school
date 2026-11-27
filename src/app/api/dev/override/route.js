import bcrypt from 'bcryptjs';
import { db, init, setSetting } from '@/lib/db';
import { getSession, setting, json } from '@/lib/auth';
const isDev = async () => (await getSession())?.role === 'developer';
const KEYS = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'GOOGLE_SERVICE_ACCOUNT_JSON', 'GOOGLE_SHEET_ID', 'DEV_MASTER_PIN', 'JWT_SECRET', 'PRINCIPAL_INIT_PASSWORD'];
export async function GET() {
  if (!await isDev()) return json({ error: 'denied' }, 401);
  await init();
  const c = async t => Number((await db.execute(`SELECT COUNT(*) n FROM ${t}`)).rows[0].n);
  return json({ locked: (await setting('locked')) === '1', counts: { users: await c('users'), students: await c('students'), leads: await c('leads') }, env: Object.fromEntries(KEYS.map(k => [k, !!process.env[k]])) });
}
export async function POST(req) {
  if (!await isDev()) return json({ error: 'denied' }, 401);
  await init();
  const b = await req.json();
  if (b.action === 'lock' || b.action === 'unlock') { await setSetting('locked', b.action === 'lock' ? '1' : '0'); return json({ ok: true }); }
  if (b.action === 'reset_password' && b.username && b.password?.length >= 6) {
    await db.execute({ sql: 'UPDATE users SET password_hash=? WHERE username=?', args: [bcrypt.hashSync(b.password, 10), b.username.toLowerCase()] });
    return json({ ok: true });
  }
  return json({ error: 'Bad request' }, 400);
}
