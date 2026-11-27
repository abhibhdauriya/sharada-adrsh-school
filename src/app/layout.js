import './globals.css';
import DevTrigger from '@/components/secret/DevTrigger';
export const metadata = { title: 'Sharda Adarsh Inter College', description: 'Official school portal', manifest: '/manifest.json' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1e40af' };
export default function RootLayout({ children }) {
  return (
    <html lang="hi"><body className="bg-slate-50 text-slate-900">
      {children}
      <footer className="text-center text-xs text-slate-500 py-6 select-none">
        <span data-dev-tap>© Sharda Adarsh Inter College</span>
      </footer>
      <DevTrigger />
    </body></html>
  );
}
