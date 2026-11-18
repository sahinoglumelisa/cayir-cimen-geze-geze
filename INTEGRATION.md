# Trail Atlas – JSON entegrasyonu

## Dosyalar
- `trails.json`: 37 rota, 12 aylık tavsiye, 7 coğrafi bölge, referans linkleri, konaklama aralıkları.
- `trails.schema.json`: temel JSON Schema.
- `trail-data-loader.js`: `fetch()` ile veri okuma, filtre, zorluk, harita ve bütçe yardımcıları.

## GitHub Pages yapısı
```
repo/
  index.html
  data/
    trails.json
  js/
    trail-data-loader.js
```

`trail-data-loader.js` içindeki import örneği:
```js
import {loadTrails, filterTrails, formatLodging, mapDisplay} from './js/trail-data-loader.js';
const catalog = await loadTrails('./data/trails.json');
const filtered = filterTrails(catalog.trails, {month: 7, region: 'dolomites'});
console.log(filtered.map(t => [t.name, formatLodging(t)]));
```
Bunu `<script type="module">` içinde çalıştır. `fetch` dosya protokolünde (`file://`) bloklanabilir; **VS Code Live Server** veya `python -m http.server 8000` kullan.

## Mevcut index.html ile uyumluluk
Önceki `index.html` 4 ay, 4 bölge ve sayfa içine gömülmüş `const data = [...]` kullanıyor. Yeni JSON'u yalnızca repoya kopyalamak **siteyi otomatik güncellemez**. Refactor sırasında:
1. `const data=[...]` yerine asenkron `loadTrails()` + başlangıç render'ı kullan.
2. `dec`, `mar`, `apr`, `may` etiketlerini 1–12 sayılarına çevir; filtre için `months_possible` ve `months_best` alanlarını ayır.
3. Bölge filtrelerine `austrian_alps`, `dolomites`, `northern_italy` ekle.
4. Bilinmeyen `distance_km`/`elevation_gain_m` değerini **0 kabul etme**; zorluk grafiğinde `unknown` olarak göster.
5. `map.geometry_verified === false` ise rota çizgisi **çizme**; yalnızca `L.marker([lat, lon])` göster. Gerçek GPX/GeoJSON sağlandığında `L.geoJSON(...)` ekle.
6. Kartta `lodging.min_eur`, `lodging.max_eur`, `lodging.estimate_only` ve `lodging.unit` göster.
7. Fotoğraf için `photo.query` kullanarak Wikimedia Commons dosyası bul; görsel, yaratıcı commons lisansı ve atıf bilgilerini doğruladıktan sonra `photo.image_url` ve `photo.credit` olarak kaydet.
8. `technical_risk` ve `season_warning_tr` alanlarını sadece efor/zorluk etiketinden ayrı göster.

## Veri kalitesi
- Kaynak linklerinden bazıları **bölgeyi anlatır**, belirli parkur varyantını değil; yayınlamadan önce varyantı, GPX'i ve istatistikleri doğrula.
- `metric_status = partial` eksik metrikler olduğunu gösterir.
- `metric_status = estimate` özellikle planlama varsayımıdır.
- `months_possible` meteorolojik tahmin/rota açıklığı garantisi değil, mevsimsel sınıflamadır.
- `lodging`: 2 kişi için **tek özel oda/gece toplam** tahminidir, kişi başı değil; ulaşım/yemek/park ve teleferik dahil değil. Gerçek zamanlı müsaitlik/fiyat sorgusu değildir.
- Dolomitler, yüksek Avusturya Alpleri ve bazı Bavyera rotaları mevsim başı/sonu kar/çığ riski taşır; kapalı patikalara girilmemeli.
- Kısa şehir yürüyüşleri günübirlik, Dolomitler ise Münih/Heilbronn'dan tipik olarak konaklamalı hafta sonu olarak düşünülmeli.

## Yeni rota ekleme şablonu
`trails.json` içindeki nesnelerden birini kopyala, benzersiz `id` kullan. Belirsiz değerleri `null` bırak, kaynağı `source_url` alanına ekle. Koordinat bulmadan GPS polylinesi oluşturma.
