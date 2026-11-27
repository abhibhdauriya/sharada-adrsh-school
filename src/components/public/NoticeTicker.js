'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
export default function NoticeTicker() {
  const [n, setN] = useState([]);
  useEffect(() => { api('/api/principal/cms').then(r => setN(r.notices || [])); }, []);
  if (!n.length) return null;
  return <div className="bg-amber-100 text-amber-900 text-sm py-1 overflow-hidden"><div className="ticker">📢 {n.map(x => x.title).join('  •  ')}</div></div>;
}
