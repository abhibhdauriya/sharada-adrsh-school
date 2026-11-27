import bcrypt from 'bcryptjs';
import { db, init } from '@/lib/db';
import { guard, json } from '@/lib/auth';
const ROLES = ['teacher', 'admin'];
export async function GET() {
  if (!await guard(['principal'])) return json({ error: 'denied' }, 401);
  await init();
  return json({ users: (await db.execute("SELECT id,username,name,role,class_name,phone FROM users WHERE role!='principal' ORDER BY role,name")).rows });
}
export async function POST(req) {
  if (!await guard(['principal'])) return json({ error: 'denied' }, 401);
  const b = await req.json();
  if (!b.username || !b.password || b.password.length < 6 || !b.name || !ROLES.includes(b.role)) return json({ error: 'Fill all fields (password min 6)' }, 400);
  try {
    await db.execute({ sql: 'INSERT INTO users(username,password_hash,name,role,class_name,phone) VALUES(?,?,?,?,?,?)', args: [b.username.trim().toLowerCase(), bcrypt.hashSync(b.password, 10), b.name, b.role, b.class_name || '', b.phone || ''] });
    return json({ ok: true });
  } catch { return json({ error: 'Username already exists' }, 409); }
}
export async function PUT(req) {
  if (!await guard(['principal'])) return json({ error: 'denied' }, 401);
  const b = await req.json();
  if (b.password) await db.execute({ sql: "UPDATE users SET password_hash=? WHERE id=? AND role!='principal'", args: [bcrypt.hashSync(b.password, 10), Number(b.id)] });
  await db.execute({ sql: "UPDATE users SET name=COALESCE(?,name), class_name=COALESCE(?,class_name), phone=COALESCE(?,phone) WHERE id=? AND role!='principal'", args: [b.name ?? null, b.class_name ?? null, b.phone ?? null, Number(b.id)] });
  return json({ ok: true });
}
export async function DELETE(req) {
  if (!await guard(['principal'])) return json({ error: 'denied' }, 401);
  await db.execute({ sql: "DELETE FROM users WHERE id=? AND role!='principal'", args: [Number(new URL(req.url).searchParams.get('id'))] });
  return json({ ok: true });
}
