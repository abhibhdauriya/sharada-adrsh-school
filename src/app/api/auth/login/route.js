import bcrypt from 'bcryptjs';
import { db, init } from '@/lib/db';
import { setSession, getSession, locked, json } from '@/lib/auth';
export async function GET() { const s = await getSession(); return json({ user: s && s.role !== 'developer' ? { name: s.name, role: s.role, cls: s.cls } : null }); }
export async function POST(req) {
  await init();
  if (await locked()) return json({ error: 'Portal temporarily locked' }, 503);
  const { username, password } = await req.json();
  const r = await db.execute({ sql: 'SELECT * FROM users WHERE username=?', args: [String(username || '').trim().toLowerCase()] });
  const u = r.rows[0];
  if (!u || !bcrypt.compareSync(String(password || ''), u.password_hash)) return json({ error: 'Invalid credentials' }, 401);
  await setSession({ uid: Number(u.id), name: u.name, role: u.role, cls: u.class_name });
  return json({ ok: true });
}
