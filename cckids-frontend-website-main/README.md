# CCK Public Web

Bu uygulama, CCK Kids monorepo içindeki Next.js tabanlı public web katmanıdır. Son kullanıcıların ürünleri, projeleri, referansları ve kurumsal içerikleri görüntülediği ana arayüzdür.

## Sorumlulukları

- ürün ve proje içeriklerini listelemek
- ürün ve proje detay sayfalarını göstermek
- teklif talep ve iletişim akışlarını kullanıcıya sunmak
- çok dilli içerik deneyimini yönetmek
- backend API üzerinden gelen verileri kullanıcı arayüzüne dönüştürmek

## Gereksinimler

- Node.js 20+
- `npm`

## Ortam Değişkenleri

Bu proje için ayrı bir `.env.example` dosyası yoktur; `.env.local` dosyasını manuel oluşturabilirsin.

Temel değişkenler:

- `NEXT_PUBLIC_API_BASE_URL`
  Public tarafta kullanılacak API taban adresi
- `INTERNAL_API_BASE_URL`
  Server-side isteklerde kullanılacak internal API adresi
- `NEXT_PUBLIC_SITE_URL`
  Site URL'si, SEO/meta üretiminde kullanılır
- `NEXT_PUBLIC_MEDIA_BASE_URL`
  Medya dosyaları için kullanılacak taban adres
- `NEXT_DISABLE_IMAGE_OPTIMIZATION`
  Lokal smoke test için image optimization kapatılabilir
- `GOOGLE_GENAI_API_KEY`
  Opsiyonel Gemini route kullanımı için gereklidir

Lokal örnek:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
INTERNAL_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:8080
NEXT_DISABLE_IMAGE_OPTIMIZATION=true
GOOGLE_GENAI_API_KEY=
```

## Lokal Geliştirme

Bağımlılıkları kur:

```bash
npm install
```

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

Varsayılan erişim:

- App: `http://localhost:3000`

## Docker / Compose Uyumu

Bu uygulama, kök dizindeki `docker-compose.local.yml` içinde `web` servisi olarak çalıştırılır. Compose senaryosunda:

- public API adresi varsayılan olarak `http://localhost:8080/api` kullanılır
- internal API erişimi container ağı içinden `http://api:8000` ile yapılır
- image optimization lokal smoke test için kapatılabilir

## Production Notları

- Build komutu: `npm run build`
- Start komutu: `npm run start`
- Docker build argümanları ile public ve internal API adresleri verilebilir
- `NEXT_PUBLIC_MEDIA_BASE_URL` tanımı, backend'in döndürdüğü relative medya yollarını doğru çözmek için önemlidir

## Notlar

- Gemini route opsiyoneldir; ana uygulama akışı için zorunlu değildir.
- Görseller için `next.config.js` içinde remote image pattern yapılandırması kullanılır.
