import { db, init } from '@/lib/db';
import { guard, locked, setting, json } from '@/lib/auth';
import { appendRow } from '@/lib/sheets';
import { link, admissionMsg } from '@/lib/whatsapp';
export async function POST(req) {
  await init();
  if (await locked()) return json({ error: 'Portal temporarily locked' }, 503);
  const b = await req.json();
  const name = String(b.name || '').trim().slice(0, 80), father = String(b.father || '').trim().slice(0, 80);
  const phone = String(b.phone || '').replace(/\D/g, '').slice(-10), cls = String(b.cls || '').trim().slice(0, 20);
  if (!name || phone.length !== 10 || !cls) return json({ error: 'Invalid details' }, 400);
  const at = new Date().toISOString();
  await db.execute({ sql: 'INSERT INTO leads(name,father_name,phone,class_name,created_at) VALUES(?,?,?,?,?)', args: [name, father, phone, cls, at] });
  const synced = await appendRow('Leads', [at, name, father, phone, cls]);
  const school = JSON.parse(await setting('school', '{}'));
  return json({ ok: true, synced, wa: link(school.phone || '', admissionMsg({ name, father, phone, cls }, school.name)) });
}
export async function GET() {
  if (!await guard(['principal', 'admin'])) return json({ error: 'denied' }, 401);
  await init();
  return json({ leads: (await db.execute('SELECT * FROM leads ORDER BY id DESC LIMIT 300')).rows });
}
