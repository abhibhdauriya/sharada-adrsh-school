import crypto from 'crypto';
import { setSession, json } from '@/lib/auth';
const h = s => crypto.createHash('sha256').update(String(s)).digest();
export async function POST(req) {
  await new Promise(r => setTimeout(r, 600)); // slow down brute force
  const { pin } = await req.json();
  if (!process.env.DEV_MASTER_PIN || !crypto.timingSafeEqual(h(pin), h(process.env.DEV_MASTER_PIN))) return json({ error: 'Denied' }, 401);
  await setSession({ role: 'developer', name: 'Developer' });
  return json({ ok: true });
}
