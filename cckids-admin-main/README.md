# CCK Admin Panel

Bu uygulama, CCK Kids monorepo içindeki Vite tabanlı yönetim panelidir. İçerik yönetimi, teklif görüntüleme ve katalog güncellemeleri bu arayüz üzerinden yapılır.

## Sorumlulukları

- admin girişi
- ürün, proje, kategori ve renk yönetimi
- ana sayfa ve kurumsal içerik yönetimi
- referans, sosyal medya ve teklif talepleri yönetimi
- backend API'nin korumalı admin endpoint'leri ile çalışma

## Gereksinimler

- Node.js 20+
- `npm`

## Ortam Değişkenleri

Production örnek dosyası:

- [.env.production.example](./.env.production.example)

Temel değişken:

- `VITE_API_URL`
  Admin panelin bağlanacağı backend API adresi

Lokal örnek:

```env
VITE_API_URL=http://localhost:8000
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

## Production Build

```bash
npm run build
```

Build çıktısı:

- `dist/`

Bu yapı sayesinde admin panel Docker zorunluluğu olmadan statik dosya olarak yayınlanabilir.

## AWS Dağıtım Notu

Bu panel için önerilen yayın modeli:

- `admin.example.com -> CloudFront -> S3`

Bu yaklaşımın uygun olmasının nedenleri:

- build sonrası statik çıktı üretmesi
- HTTPS ve custom domain yönetimini kolaylaştırması
- CloudFront cache invalidation desteği sunması

Bu projede `HashRouter` kullanıldığı için ek SPA rewrite ihtiyacı azaltılmıştır.

Hazır deploy scripti:

- [scripts/deploy-admin.ps1](./scripts/deploy-admin.ps1)

Örnek kullanım:

```powershell
$env:VITE_API_URL="https://api.example.com"
.\scripts\deploy-admin.ps1 -BucketName "your-admin-bucket" -CloudFrontDistributionId "DIST_ID"
```

## Notlar

- API adresi istemci tarafında `VITE_API_URL` üzerinden çözülür.
- Production erişim modeli CloudFront ve IAM politikaları ile sınırlandırılmalıdır.
