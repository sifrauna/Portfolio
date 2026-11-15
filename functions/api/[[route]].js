// Cloudflare Pages Function: /api/content (public read), /api/auth, /api/save (password protected)
const enc = new TextEncoder()
const sha = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))
const same = (a, b) => { let r = 0; for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i]; return r === 0 }
const json = (v, status = 200) => new Response(typeof v === 'string' ? v : JSON.stringify(v), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

async function authorised(request, env) {
  if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) return false
  const h = request.headers.get('authorization') || ''
  if (!h.startsWith('Basic ')) return false
  let raw
  try { raw = new TextDecoder().decode(Uint8Array.from(atob(h.slice(6)), (c) => c.charCodeAt(0))) } catch { return false }
  const i = raw.indexOf(':'); if (i < 0) return false
  const [u1, u2, p1, p2] = await Promise.all([sha(raw.slice(0, i)), sha(env.ADMIN_USER), sha(raw.slice(i + 1)), sha(env.ADMIN_PASSWORD)])
  return same(u1, u2) && same(p1, p2)
}

export async function onRequest({ request, env, params }) {
  const route = [].concat(params.route || [])[0], method = request.method
  if (route === 'content' && method === 'GET') return json((await env.PORTFOLIO.get('content')) || 'null')
  if ((route === 'auth' || route === 'save') && method === 'POST') {
    if (!(await authorised(request, env))) { await new Promise((r) => setTimeout(r, 1000)); return json({ error: 'unauthorised' }, 401) }
    if (route === 'auth') return json({ ok: true })
    const text = await request.text()
    if (text.length > 8_000_000) return json({ error: 'too large' }, 413)
    let d; try { d = JSON.parse(text) } catch { return json({ error: 'bad json' }, 400) }
    if (!d || typeof d.profile !== 'object' || !['projects', 'skills', 'experience', 'updates'].every((k) => Array.isArray(d[k]))) return json({ error: 'bad shape' }, 400)
    delete d.admin
    await env.PORTFOLIO.put('content', JSON.stringify(d))
    return json({ ok: true })
  }
  return json({ error: 'not found' }, 404)
}
