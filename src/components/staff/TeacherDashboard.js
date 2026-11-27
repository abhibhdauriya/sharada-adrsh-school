'use client';
import { useEffect, useState } from 'react';
import { api, inp, btn } from '@/lib/client';
export default function TeacherDashboard({ cls }) {
  const [st, setSt] = useState([]); const [tab, setTab] = useState('att');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [abs, setAbs] = useState({}); const [alerts, setAlerts] = useState([]);
  const [ex, setEx] = useState({ exam: '', subject: '', max: 100 }); const [marks, setMarks] = useState({}); const [msg, setMsg] = useState('');
  useEffect(() => { api('/api/students').then(r => setSt(r.students || [])); }, []);
  async function saveAtt() {
    const r = await api('/api/academic/attendance', 'POST', { date, records: st.map(s => ({ student_id: s.id, status: abs[s.id] ? 'A' : 'P' })) });
    setMsg(r.ok ? `✅ Saved ${r.saved}` : '❌ ' + r.error); setAlerts(r.alerts || []);
  }
  async function saveMarks() {
    const r = await api('/api/academic/results', 'POST', { exam: ex.exam, subject: ex.subject, max_marks: ex.max, records: st.map(s => ({ student_id: s.id, marks: marks[s.id] })) });
    setMsg(r.ok ? `✅ Saved ${r.saved}` : '❌ ' + r.error);
  }
  return (
    <div>
      <p className="text-sm mb-2">Class: <b>{cls || '—'}</b> · {st.length} students</p>
      <div className="flex gap-2 mb-3">{[['att', 'Attendance'], ['marks', 'Marks']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`${btn} ${tab !== k && '!bg-slate-300 !text-black'}`}>{l}</button>)}</div>
      {tab === 'att' ? <>
        <input type="date" className={inp + ' mb-2'} value={date} onChange={e => setDate(e.target.value)} />
        {st.map(s => <label key={s.id} className="flex justify-between bg-white border rounded p-2 mb-1 text-sm"><span>{s.roll_no}. {s.name}</span><span><input type="checkbox" checked={!!abs[s.id]} onChange={e => setAbs({ ...abs, [s.id]: e.target.checked })} /> Absent</span></label>)}
        <button className={btn + ' w-full mt-2'} onClick={saveAtt}>Save attendance</button>
        {alerts.map(a => <a key={a.wa} href={a.wa} target="_blank" className="block mt-2 bg-green-600 text-white rounded p-2 text-sm">📲 WhatsApp parent of {a.name}</a>)}
      </> : <>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input className={inp} placeholder="Exam" value={ex.exam} onChange={e => setEx({ ...ex, exam: e.target.value })} />
          <input className={inp} placeholder="Subject" value={ex.subject} onChange={e => setEx({ ...ex, subject: e.target.value })} />
          <input className={inp} type="number" placeholder="Max" value={ex.max} onChange={e => setEx({ ...ex, max: e.target.value })} />
        </div>
        {st.map(s => <div key={s.id} className="flex justify-between items-center bg-white border rounded p-2 mb-1 text-sm"><span>{s.roll_no}. {s.name}</span><input type="number" className="border rounded w-20 p-1" value={marks[s.id] ?? ''} onChange={e => setMarks({ ...marks, [s.id]: e.target.value })} /></div>)}
        <button className={btn + ' w-full mt-2'} onClick={saveMarks}>Save marks</button>
      </>}
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}
