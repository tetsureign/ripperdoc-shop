#!/usr/bin/env node
// Run from host (outside sandbox): node scripts/scaffold.mjs
// Requires API at http://localhost:5000 and .env with ADMIN_EMAIL/PASSWORD

import fs from 'fs';

function loadEnv(path = '.env') {
  if (!fs.existsSync(path)) return {};
  const out = {};
  for (const line of fs.readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1].trim()] = v;
  }
  return out;
}

const env = loadEnv('.env');
const API = process.env.API_URL || 'http://localhost:5000';
const EMAIL = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@example.com';
const PASS = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'AdminPassword123!';

console.log(`API: ${API} | admin: ${EMAIL}`);

let token = '';
let cookie = '';

async function login() {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Login failed ${res.status}: ${text}`);
  const data = JSON.parse(text || '{}');
  token = data.token || data.Token || '';
  const setCookie = res.headers.get('set-cookie') || '';
  if (setCookie) cookie = setCookie.split(';')[0];
  console.log(`Logged in. token: ${token ? token.slice(0, 20) + '...' : '(cookie only)'} cookie: ${cookie ? 'yes' : 'no'}`);
  if (!token && !cookie) throw new Error('No token or cookie returned');
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (cookie) h['Cookie'] = cookie;
  return h;
}

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { res, json, text, ok: res.ok, status: res.status };
}

// Data
const categories = [
  { name: 'Neural Implants', description: 'Cortex co-processors, memory shards, and reflex boosters.' },
  { name: 'Optics & Vision', description: 'Kiroshi-grade optics, thermal and night vision.' },
  { name: 'Dermal Armor', description: 'Subdermal plating and skin weave for street survival.' },
  { name: 'Cyberlimbs', description: 'Arms and legs with hydraulic grip and recoil control.' },
  { name: 'Bioware', description: 'Grafted muscle, second heart, and toxin filters.' },
  { name: 'Netrunning Deck', description: 'Cyberdecks and ICE breakers for deep dives.' },
];

const brands = [
  { name: 'Kiroshi', description: 'Market leader in optics. See everything.' },
  { name: 'Arasaka', description: 'Security, steel, and soulkiller legacy.' },
  { name: 'Militech', description: 'Military-grade chrome, built for war.' },
  { name: 'Kang Tao', description: 'Smart weapons and neural links.' },
  { name: 'Biotechnica', description: 'Meat and chrome, grown better.' },
];

const productsByCategory = {
  'Neural Implants': [
    { name: 'Axon Reflex Booster Mk.3', description: 'Cuts synaptic delay by 40ms. Feels like time slows.', price: 2400, imageUrl: 'https://picsum.photos/seed/axon/800/600', isFeatured: true },
    { name: 'Mnemonic Memory Shard 64TB', description: 'Never forget a face, a code, or a sin.', price: 890, imageUrl: 'https://picsum.photos/seed/memory/800/600', isFeatured: false },
  ],
  'Optics & Vision': [
    { name: 'Kiroshi Optics Mk.4 "Clear-Eye"', description: 'Thermal, night vision, and threat highlight. Street legal.', price: 1850, imageUrl: 'https://picsum.photos/seed/kiroshi/800/600', isFeatured: true },
    { name: 'Oracle Holosight', description: 'Pinpoint targeting overlay with wind correction.', price: 1200, imageUrl: 'https://picsum.photos/seed/oracle/800/600', isFeatured: false },
  ],
  'Dermal Armor': [
    { name: 'Subdermal Weave - Titanium', description: 'Stops small caliber. Hurts less than it looks.', price: 3200, imageUrl: 'https://picsum.photos/seed/dermal/800/600', isFeatured: true },
    { name: 'Nanite Skin Repair', description: 'Clots in seconds, scars in minutes.', price: 650, imageUrl: 'https://picsum.photos/seed/nanite/800/600', isFeatured: false },
  ],
  'Cyberlimbs': [
    { name: 'Gorilla Arms - Heavy Hitters', description: 'Rip doors, punch through walls. Civilians beware.', price: 4500, imageUrl: 'https://picsum.photos/seed/gorilla/800/600', isFeatured: true },
    { name: 'Mantis Blades - Folded Steel', description: 'Elegant, lethal, and very illegal in most districts.', price: 5200, imageUrl: 'https://picsum.photos/seed/mantis/800/600', isFeatured: false },
  ],
  'Bioware': [
    { name: 'Second Heart - Ventricular Boost', description: 'Keeps you alive when the first one quits.', price: 2800, imageUrl: 'https://picsum.photos/seed/heart/800/600', isFeatured: false },
    { name: 'Biotechnica Synaptic Amplifier', description: 'Pain editor and focus control in one gland.', price: 1950, imageUrl: 'https://picsum.photos/seed/synaptic/800/600', isFeatured: true },
  ],
  'Netrunning Deck': [
    { name: 'Tetratronic Rippler Mk.5', description: '8 RAM, 4 buffer. Enough to flatline most ICE.', price: 3800, imageUrl: 'https://picsum.photos/seed/rippler/800/600', isFeatured: true },
    { name: 'Arasaka Netdeck "Shingen"', description: 'Corporate ICE breaker. Leaves no trace.', price: 4100, imageUrl: 'https://picsum.photos/seed/shingen/800/600', isFeatured: false },
  ],
};

async function ensureCategories() {
  console.log('\n-- Categories --');
  const existing = await api('/api/admin/categories?includeDeleted=false&page=1&pageSize=100');
  // Admin list returns {categories: [...]} or paginated? check shape
  const list = existing.json?.categories || existing.json?.Categories || existing.json?.items || [];
  const byName = new Map(list.map(c => [(c.name || c.Name), c]));
  const idMap = new Map();
  for (const cat of categories) {
    if (byName.has(cat.name)) {
      const id = byName.get(cat.name).id || byName.get(cat.name).Id;
      console.log(`exists: ${cat.name} -> ${id}`);
      idMap.set(cat.name, id);
      continue;
    }
    const r = await api('/api/admin/categories', { method: 'POST', body: JSON.stringify(cat) });
    if (!r.ok) { console.error(`create failed ${cat.name}: ${r.status} ${r.text}`); continue; }
    const created = r.json;
    const id = created.id || created.Id;
    console.log(`created: ${cat.name} -> ${id}`);
    idMap.set(cat.name, id);
  }
  return idMap;
}

async function ensureBrands() {
  console.log('\n-- Brands --');
  const existing = await api('/api/admin/brands?includeDeleted=false&page=1&pageSize=100');
  const list = existing.json?.brands || existing.json?.Brands || [];
  const byName = new Map(list.map(b => [(b.name || b.Name), b]));
  const idMap = new Map();
  for (const b of brands) {
    if (byName.has(b.name)) {
      const id = byName.get(b.name).id || byName.get(b.name).Id;
      console.log(`exists: ${b.name} -> ${id}`);
      idMap.set(b.name, id);
      continue;
    }
    const r = await api('/api/admin/brands', { method: 'POST', body: JSON.stringify(b) });
    if (!r.ok) { console.error(`create failed ${b.name}: ${r.status} ${r.text}`); continue; }
    const created = r.json;
    const id = created.id || created.Id;
    console.log(`created: ${b.name} -> ${id}`);
    idMap.set(b.name, id);
  }
  return idMap;
}

async function ensureProducts(catIds, brandIds) {
  console.log('\n-- Products --');
  // fetch existing admin products to avoid duplicates
  const existing = await api('/api/admin/products?includeDeleted=false&page=1&pageSize=200');
  const list = existing.json?.products || existing.json?.Products || [];
  const byName = new Set(list.map(p => p.name || p.Name));

  // Map category to brand for variety: round-robin
  const brandNames = brands.map(b => b.name);
  let bi = 0;

  for (const catName of Object.keys(productsByCategory)) {
    const catId = catIds.get(catName);
    if (!catId) { console.error(`missing catId for ${catName}`); continue; }
    for (const prod of productsByCategory[catName]) {
      if (byName.has(prod.name)) { console.log(`skip exists product: ${prod.name}`); continue; }
      const brandName = brandNames[bi % brandNames.length]; bi++;
      const brandId = brandIds.get(brandName);
      const payload = {
        name: prod.name,
        description: prod.description,
        imageUrl: prod.imageUrl,
        price: prod.price,
        isFeatured: prod.isFeatured,
        categoryId: catId,
        brandId: brandId || null,
      };
      const r = await api('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      if (!r.ok) { console.error(`create product failed ${prod.name}: ${r.status} ${r.text}`); continue; }
      console.log(`created product: ${prod.name} (${prod.price}) cat:${catName} brand:${brandName} featured:${prod.isFeatured}`);
    }
  }
}

async function main() {
  try {
    await login();
    const catIds = await ensureCategories();
    const brandIds = await ensureBrands();
    await ensureProducts(catIds, brandIds);
    console.log('\nDone. Visit http://localhost:3001/shop and http://localhost:5173/terminal/');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
