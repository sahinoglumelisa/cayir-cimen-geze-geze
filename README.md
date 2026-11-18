# Çayır Çimen Geze Geze — Trail Atlas

Statik, mobil uyumlu 12 aylık yürüyüş ve gezi planlayıcısı.

## Publish to GitHub Pages
1. Create a public GitHub repository (e.g. `trail-atlas`).
2. Upload `index.html`, `trails.json`, `trails-turkey.json` and `weather-fallback.json` to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, and save.
4. Visit `https://YOUR-USERNAME.github.io/cayir-cimen-geze-geze/` after deployment.

No build step or backend required. Requires Internet access for Leaflet, OpenStreetMap tiles, fonts, and remote images.

**Important:** Map lines are schematic connections between major points, not GPS tracks. The distance–ascent plot represents total length vs total gain, NOT actual elevation profiles. The trail conditions and photos must be checked at planning time.

## Uygunluk skoru (0–100)
Her ay seçildiğinde rotalar skorlanıp en uygundan en az uyguna sıralanır; **Min skor** eşiğinin altındakiler gizlenir ve nedenleri gösterilir.

| Bileşen | Kaynak |
|---|---|
| Mevsim | `months_best` (100) / `months_possible` (60) / sezon dışı (gizlenir) |
| Hava | Open-Meteo: içinde bulunulan ay için canlı 16 günlük tahmin, diğer aylar için son 2 yılın gerçekleşen günlük verisi (sıcaklık, yağışlı gün, kar, rüzgar, güneş) |
| Güvenlik | `technical_risk` + hava etkileşimi (alpin rotada kar/buz, kaygan rotada yağmur) |
| Gün ışığı | Enleme göre gün uzunluğu vs. `estimated_moving_hours` |
| Ulaşım | **Çıkış** noktasına uzaklık; günübirlik planlarda ağırlığı artar |
| Plan uyumu / veri güveni | `overnight_recommended_for_trip`, `metric_status` |

Hava verisi tarayıcıda önbelleğe alınır (tahmin 3 saat, geçmiş veri kalıcı). API anahtarı gerekmez.

**Yedek:** Canlı API cevap vermezse önce tarayıcıdaki son başarılı veri, o da yoksa `weather-fallback.json` (son 24 ayın aylık ortalaması) kullanılır. Yenilemek için: `node scripts/build-weather-fallback.mjs` (~7 dk, API limitine takılmamak için yavaş çalışır).

**En iyi günler:** Seçili ay canlı tahminin 16 günlük penceresine giriyorsa, her rota için en iyi günler ve seçilen gece sayısına göre en iyi tarih aralığı gösterilir.
