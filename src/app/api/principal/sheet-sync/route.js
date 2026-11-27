import { db, init, upsertStudents } from '@/lib/db';
import { guard, json } from '@/lib/auth';
import { readRows, writeAll } from '@/lib/sheets';
export async function POST(req) {
  if (!await guard(['principal'])) return json({ error: 'denied' }, 401);
  await init();
  const { direction } = await req.json();
  try {
    if (direction === 'push') {
      const r = (await db.execute('SELECT roll_no,name,father_name,class_name,dob,parent_phone,fee_due FROM students ORDER BY class_name,roll_no')).rows;
      await writeAll('Students', ['roll_no', 'name', 'father_name', 'class_name', 'dob', 'parent_phone', 'fee_due'], r.map(x => [x.roll_no, x.name, x.father_name, x.class_name, x.dob, x.parent_phone, x.fee_due]));
      return json({ ok: true, count: r.length });
    }
    const rows = await readRows('Students');
    const n = await upsertStudents(rows.map(([roll_no, name, father_name, class_name, dob, parent_phone, fee_due]) => ({ roll_no, name, father_name, class_name, dob, parent_phone, fee_due })));
    return json({ ok: true, count: n });
  } catch (e) { return json({ error: e.message }, 500); }
}
