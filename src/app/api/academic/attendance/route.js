import { db, init } from '@/lib/db';
import { guard, allowedIds, setting, json } from '@/lib/auth';
import { link, absentMsg } from '@/lib/whatsapp';
export async function POST(req) {
  const s = await guard(['principal', 'admin', 'teacher']); if (!s) return json({ error: 'denied' }, 401);
  await init();
  const { date, records } = await req.json();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !Array.isArray(records)) return json({ error: 'Bad request' }, 400);
  const ok = await allowedIds(s, records.map(r => Number(r.student_id)));
  const rec = records.filter(r => ok.includes(Number(r.student_id)));
  if (!rec.length) return json({ error: 'No permitted students' }, 403);
  await db.batch(rec.map(r => ({ sql: 'INSERT INTO attendance(student_id,date,status) VALUES(?,?,?) ON CONFLICT(student_id,date) DO UPDATE SET status=excluded.status', args: [Number(r.student_id), date, r.status === 'A' ? 'A' : 'P'] })), 'write');
  const abs = rec.filter(r => r.status === 'A').map(r => Number(r.student_id));
  let alerts = [];
  if (abs.length) {
    const st = await db.execute({ sql: `SELECT name,parent_phone FROM students WHERE id IN (${abs.map(() => '?').join()})`, args: abs });
    const school = JSON.parse(await setting('school', '{}'));
    alerts = st.rows.map(x => ({ name: x.name, wa: link(x.parent_phone, absentMsg(x.name, date, school.name)) }));
  }
  return json({ ok: true, saved: rec.length, alerts });
}
