# yol-izi

yol-izi, ziyaret edilen şehirleri harita üzerinde kaydetmek, anı eklemek ve geçmiş yolculukları yönetmek için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- Gezi ekleme, düzenleme ve silme
- Şehir, ülke, tarih, not, puan ve fotoğraf bağlantısı kaydı
- Tek harften başlayan şehir önerileri
- 3B dünya üzerinde gezi konumları
- Gezi arama ve detay görüntüleme
- Verileri tarayıcının yerel depolamasında saklama
- Mobil ekranlara uyumlu arayüz

## Kullanılan teknolojiler

- React 19
- Vite
- CSS ve Tailwind CSS
- react-globe.gl ve Three.js
- Open-Meteo Geocoding API
- GeoNames şehir verisi

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://127.0.0.1:5173/` adresinde açılır.

## Komutlar

```bash
npm run dev           # geliştirme sunucusu
npm run build         # üretim derlemesi
```

## Veri ve gizlilik

Gezi kayıtları yalnızca kullanıcının kendi tarayıcısındaki `localStorage` alanında saklanır. Uygulama kullanıcı hesabı veya sunucu tarafında veri tabanı kullanmaz.

Şehir önerileri GeoNames kaynaklı yerel dizinden gelir. Daha ayrıntılı konum aramaları için Open-Meteo Geocoding API kullanılır.

## Lisans ve kaynaklar

Şehir verileri için GeoNames verisi kullanılır. Ayrıntılar [public/data/README.md](public/data/README.md) dosyasında yer alır.
