'use client';
import { useState } from 'react';
import { api, inp, btn, useLang } from '@/lib/client';
export default function ResultLookup() {
  const { t } = useLang();
  const [roll, setRoll] = useState(''); const [dob, setDob] = useState(''); const [d, setD] = useState(null); const [err, setErr] = useState('');
  async function go(e) {
    e.preventDefault(); setErr(''); setD(null);
    const r = await api(`/api/academic/results?roll=${encodeURIComponent(roll)}&dob=${dob}`);
    r.error ? setErr(r.error) : setD(r);
  }
  const exams = d ? [...new Set(d.results.map(x => x.exam))] : [];
  return (
    <div>
      <form onSubmit={go} className="space-y-2">
        <input className={inp} placeholder={t('roll')} value={roll} onChange={e => setRoll(e.target.value)} required />
        <input className={inp} type="date" value={dob} onChange={e => setDob(e.target.value)} required />
        <button className={btn + ' w-full'}>{t('view')}</button>
      </form>
      {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
      {d && (
        <div className="mt-3 bg-white rounded-lg border p-3 text-sm">
          <p className="font-semibold">{d.student.name} — {t('cls')} {d.student.class_name} (Roll {d.student.roll_no})</p>
          <p>{t('att')}: {d.attendance.present}/{d.attendance.total}{d.attendance.total ? ` (${Math.round(100 * d.attendance.present / d.attendance.total)}%)` : ''}</p>
          {exams.map(ex => { const rows = d.results.filter(x => x.exam === ex); const m = rows.reduce((a, x) => a + x.marks, 0), M = rows.reduce((a, x) => a + x.max_marks, 0);
            return <table key={ex} className="w-full mt-2 border"><caption className="text-left font-semibold">{ex}</caption>
              <tbody>{rows.map(x => <tr key={x.subject} className="border-t"><td className="p-1">{x.subject}</td><td className="p-1 text-right">{x.marks}/{x.max_marks}</td></tr>)}
              <tr className="border-t font-bold"><td className="p-1">Total</td><td className="p-1 text-right">{m}/{M}</td></tr></tbody></table>; })}
          {!exams.length && <p className="text-slate-500">No marks uploaded yet.</p>}
        </div>
      )}
    </div>
  );
}
