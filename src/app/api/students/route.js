import { db, init, upsertStudents } from '@/lib/db';
import { guard, json } from '@/lib/auth';
import { appendRow } from '@/lib/sheets';
export async function GET() {
  const s = await guard(['principal', 'admin', 'teacher']); if (!s) return json({ error: 'denied' }, 401);
  await init();
  const t = s.role === 'teacher';
  const r = await db.execute({ sql: `SELECT * FROM students ${t ? 'WHERE class_name=?' : ''} ORDER BY class_name, CAST(roll_no AS INTEGER), roll_no`, args: t ? [s.cls] : [] });
  return json({ students: r.rows });
}
export async function POST(req) {
  const s = await guard(['principal', 'admin']); if (!s) return json({ error: 'denied' }, 401);
  await init();
  const b = await req.json(); const list = Array.isArray(b.students) ? b.students : [b];
  const n = await upsertStudents(list);
  for (const x of list.slice(0, 50)) if (x.roll_no && x.name) await appendRow('Students', [x.roll_no, x.name, x.father_name || '', x.class_name || '', x.dob || '', x.parent_phone || '', x.fee_due || 0]);
  return json({ ok: true, saved: n });
}
export async function PATCH(req) {
  const s = await guard(['principal', 'admin']); if (!s) return json({ error: 'denied' }, 401);
  const { id, fee_due } = await req.json();
  await db.execute({ sql: 'UPDATE students SET fee_due=? WHERE id=?', args: [Number(fee_due) || 0, Number(id)] });
  return json({ ok: true });
}
export async function DELETE(req) {
  const s = await guard(['principal']); if (!s) return json({ error: 'denied' }, 401);
  const id = Number(new URL(req.url).searchParams.get('id'));
  await db.batch([{ sql: 'DELETE FROM attendance WHERE student_id=?', args: [id] }, { sql: 'DELETE FROM results WHERE student_id=?', args: [id] }, { sql: 'DELETE FROM students WHERE id=?', args: [id] }], 'write');
  return json({ ok: true });
}
