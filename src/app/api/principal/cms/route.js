import { db, init, setSetting } from '@/lib/db';
import { guard, setting, json } from '@/lib/auth';
export async function GET() {
  await init();
  const notices = (await db.execute('SELECT id,title,body,created_at FROM notices ORDER BY id DESC LIMIT 30')).rows;
  return json({ notices, school: JSON.parse(await setting('school', '{}')), fees: await setting('fees', ''), gallery: JSON.parse(await setting('gallery', '[]')) });
}
export async function POST(req) {
  if (!await guard(['principal'])) return json({ error: 'denied' }, 401);
  const b = await req.json();
  if (b.type === 'notice' && b.title) await db.execute({ sql: 'INSERT INTO notices(title,body,created_at) VALUES(?,?,?)', args: [String(b.title).slice(0, 150), String(b.body || '').slice(0, 1000), new Date().toISOString()] });
  else if (b.type === 'delete_notice') await db.execute({ sql: 'DELETE FROM notices WHERE id=?', args: [Number(b.id)] });
  else if (b.type === 'setting' && ['school', 'fees', 'gallery'].includes(b.key)) await setSetting(b.key, typeof b.value === 'string' ? b.value : JSON.stringify(b.value));
  else return json({ error: 'Bad request' }, 400);
  return json({ ok: true });
}
