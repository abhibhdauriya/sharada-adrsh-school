'use client';
import { useLang } from '@/lib/client';
export default function Header() {
  const { t, toggle, label } = useLang();
  const L = [['#home', 'home'], ['#about', 'about'], ['#admission', 'admission'], ['#result', 'result']];
  return (
    <header className="sticky top-0 z-10 bg-blue-900 text-white shadow">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-3 py-2 gap-2">
        <b className="text-sm">Sharda Adarsh Inter College</b>
        <button onClick={toggle} className="text-xs border rounded px-2 py-1">{label}</button>
      </div>
      <nav className="max-w-4xl mx-auto flex gap-4 overflow-x-auto px-3 pb-2 text-sm whitespace-nowrap">
        {L.map(([h, k]) => <a key={k} href={h}>{t(k)}</a>)}
        <a href="/staff" className="ml-auto font-semibold">{t('staffLogin')}</a>
      </nav>
    </header>
  );
}
