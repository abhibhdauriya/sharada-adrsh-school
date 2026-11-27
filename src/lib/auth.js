import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db, init } from './db';
const key = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const json = (d, status = 200) => Response.json(d, { status });
export async function setSession(p) {
  const t = await new SignJWT(p).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('12h').sign(key());
  cookies().set('sess', t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 43200 });
}
export async function getSession() {
  try { const t = cookies().get('sess')?.value; return t ? (await jwtVerify(t, key())).payload : null; } catch { return null; }
}
export async function setting(k, d = null) {
  await init();
  const r = await db.execute({ sql: 'SELECT value FROM settings WHERE key=?', args: [k] });
  return r.rows[0] ? r.rows[0].value : d;
}
export const locked = async () => (await setting('locked')) === '1';
// Returns session if role allowed (developer always allowed) and portal not locked
export async function guard(roles) {
  const s = await getSession();
  if (!s || (s.role !== 'developer' && !roles.includes(s.role))) return null;
  if (s.role !== 'developer' && await locked()) return null;
  return s;
}
// Teachers may only touch students of their own class
export async function allowedIds(s, ids) {
  if (!ids.length) return [];
  const t = s.role === 'teacher';
  const r = await db.execute({ sql: `SELECT id FROM students WHERE id IN (${ids.map(() => '?').join()})` + (t ? ' AND class_name=?' : ''), args: t ? [...ids, s.cls] : ids });
  return r.rows.map(x => Number(x.id));
}
