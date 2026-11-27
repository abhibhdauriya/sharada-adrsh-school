import { db, init } from '@/lib/db';
import { guard, allowedIds, locked, json } from '@/lib/auth';
export async function POST(req) {
  const s = await guard(['principal', 'admin', 'teacher']); if (!s) return json({ error: 'denied' }, 401);
  await init();
  const { exam, subject, max_marks, records } = await req.json();
  if (!exam || !subject || !Array.isArray(records)) return json({ error: 'Bad request' }, 400);
  const ok = await allowedIds(s, records.map(r => Number(r.student_id)));
  const rec = records.filter(r => ok.includes(Number(r.student_id)) && r.marks !== '' && r.marks != null);
  if (!rec.length) return json({ error: 'Nothing to save' }, 400);
  await db.batch(rec.map(r => ({ sql: 'INSERT INTO results(student_id,exam,subject,marks,max_marks) VALUES(?,?,?,?,?) ON CONFLICT(student_id,exam,subject) DO UPDATE SET marks=excluded.marks,max_marks=excluded.max_marks', args: [Number(r.student_id), String(exam).slice(0, 40), String(subject).slice(0, 40), Number(r.marks), Number(max_marks) || 100] })), 'write');
  return json({ ok: true, saved: rec.length });
}
// Public: Roll No + DOB
export async function GET(req) {
  await init();
  if (await locked()) return json({ error: 'Portal temporarily locked' }, 503);
  const q = new URL(req.url).searchParams, roll = (q.get('roll') || '').trim(), dob = (q.get('dob') || '').trim();
  const st = (await db.execute({ sql: 'SELECT id,roll_no,name,father_name,class_name FROM students WHERE roll_no=? AND dob=?', args: [roll, dob] })).rows[0];
  if (!st) return json({ error: 'Not found — check Roll No & DOB' }, 404);
  const results = (await db.execute({ sql: 'SELECT exam,subject,marks,max_marks FROM results WHERE student_id=? ORDER BY exam,subject', args: [st.id] })).rows;
  const a = (await db.execute({ sql: "SELECT SUM(status='P') p, COUNT(*) t FROM attendance WHERE student_id=?", args: [st.id] })).rows[0];
  return json({ student: { roll_no: st.roll_no, name: st.name, father_name: st.father_name, class_name: st.class_name }, results, attendance: { present: Number(a.p) || 0, total: Number(a.t) || 0 } });
}
