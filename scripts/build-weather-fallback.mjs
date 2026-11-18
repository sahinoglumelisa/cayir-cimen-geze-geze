// Statik hava yedeği üretir: node scripts/build-weather-fallback.mjs
// Son 24 tam ayın Open-Meteo arşiv verisinden, her rota başlangıç noktası ve her ay için
// index.html'deki summarize() ile aynı özetleri hesaplayıp weather-fallback.json'a yazar.
// Canlı API çalışmadığında ve tarayıcıda önbellek yokken site bu dosyayla skorlar.
import { readFileSync, writeFileSync } from "node:fs";

const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,sunshine_duration";
const BATCH = 10, PAUSE_MS = 65_000; // Open-Meteo dakikalık limitine takılmamak için
const routes = ["trails.json", "trails-turkey.json"].flatMap(f => JSON.parse(readFileSync(f, "utf8")).trails);
const coordKey = r => `${(+r.lat).toFixed(2)},${(+r.lon).toFixed(2)}`;
const keys = [...new Set(routes.filter(r => r.lat != null && r.lon != null).map(coordKey))];

const now = new Date();
const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)); // geçen ayın son günü
const start = new Date(Date.UTC(end.getUTCFullYear() - 2, end.getUTCMonth() + 1, 1)); // 24 ay önce
const iso = d => d.toISOString().slice(0, 10);

const avg = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const r2 = x => (x == null ? null : Math.round(x * 100) / 100);
function summarize(d, idx) {
  const v = f => idx.map(j => d[f]?.[j]).filter(x => x != null);
  const pr = v("precipitation_sum"), sn = v("snowfall_sum"), sun = avg(v("sunshine_duration"));
  return {
    days: idx.length,
    tmax: r2(avg(v("temperature_2m_max"))), tmin: r2(avg(v("temperature_2m_min"))),
    rain: pr.length ? r2(pr.filter(x => x >= 1).length / pr.length) : null,
    snow: sn.length ? r2(sn.filter(x => x >= 0.5).length / sn.length) : null,
    wind: r2(avg(v("wind_speed_10m_max"))), sun: sun == null ? null : r2(sun / 3600), pop: null,
  };
}

const months = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, {}]));
for (let b = 0; b < keys.length; b += BATCH) {
  const part = keys.slice(b, b + BATCH);
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${part.map(k => k.split(",")[0])}&longitude=${part.map(k => k.split(",")[1])}&start_date=${iso(start)}&end_date=${iso(end)}&daily=${DAILY}&timezone=auto`;
  const res = await fetch(url), j = await res.json();
  if (!res.ok || j.error) throw new Error(`Open-Meteo: ${j.reason || res.status}`);
  (Array.isArray(j) ? j : [j]).forEach((loc, i) => {
    for (let m = 1; m <= 12; m++) {
      const mm = `-${String(m).padStart(2, "0")}-`;
      const idx = loc.daily.time.map((_, k) => k).filter(k => loc.daily.time[k].includes(mm));
      months[m][part[i]] = summarize(loc.daily, idx);
    }
  });
  console.log(`${Math.min(b + BATCH, keys.length)}/${keys.length} konum`);
  if (b + BATCH < keys.length) await new Promise(r => setTimeout(r, PAUSE_MS));
}

writeFileSync("weather-fallback.json", JSON.stringify({
  generated_at: iso(now), source: "Open-Meteo archive API", start: iso(start), end: iso(end), months,
}));
console.log("weather-fallback.json yazıldı");
