# Türkiye rotalarını Trail Atlas’a ekleme

- `trails-turkey.json`: Türkiye için 28 rota; mevcut `trails.json` ile aynı temel alanlar.
- `trails-all.json`: önceki 37 Avrupa rotası + 28 Türkiye rotası, toplam 65 rota. **En kolay yol** bu dosyayı sitendeki `data/trails.json` olarak kullanmak.
- `trail-data-loader.js`: TRY ve EUR bütçe değerlerini destekleyen güncellenmiş loader.
- `trails.schema.json`: `country: TR` destekler.

## Repo yapısı

```text
repo/
  index.html
  data/trails.json          # trails-all.json dosyasını buraya bu adla koy
  js/trail-data-loader.js   # güncellenmiş dosya
```

## Örnek

```js
import { loadTrails, filterTrails, formatLodging } from './js/trail-data-loader.js';
const db = await loadTrails('./data/trails.json');
const april = filterTrails(db.trails, {month:4, region:'tr_mediterranean'});
console.log(april.map(t => ({name:t.name, lodging:formatLodging(t)})));
```

## Dikkat

- Sitenin eski `index.html` dosyasında hardcoded dört ay/bölge filtreleri var. `tr_mediterranean`, `tr_marmara`, `tr_aegean`, `tr_central`, `tr_black_sea_west`, `tr_black_sea_east`, `tr_east` değerlerini ekleyin.
- `months_possible` yürüyüşün **kesin güvenli** olduğu anlamına gelmez.
- Birçok rotanın `distance_km`/`elevation_gain_m` alanı tahmini veya `null` — bilmediğiniz metriği sıfır yazmayın. Kesin GPS yürüyüş rotası sağlamadım; `map.geometry_verified: false` olunca yalnızca marker çizilmeli.
- Karia, Likya ve Kaçkarlar gibi uzun mesafe güzergâhlarının **günübirlik etabı belirlenmeden** doğru yürüyüş uzunluğu verilemez; `null` değerleri seçilen etapla doldurun.
- Fotoğraf arama terimi verilmiştir, gerçek görselleri telif ve atıf kontrolüyle ekleyin.
- Türkiye bütçeleri kaba TL tahminleri, canlı konaklama fiyatları değil; uçuş, araç, yemek ve milli park ücretleri dahil değil.
- Koruma alanları, orman yangını yasakları, izne/rehbere tabi bölümler ve yerel uyarıları mutlaka kontrol edin.
