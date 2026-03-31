# CCK Kids Admin Panel

Bu proje, `cckids-admin-main` içindeki Vite tabanlı yönetim panelidir.

## Local Run

Gerekenler:

- Node.js

Kurulum:

```bash
npm install
```

Ortam değişkeni:

```env
VITE_API_URL=http://localhost:8000
```

Çalıştırma:

```bash
npm run dev
```

## Production Build

Production için örnek env dosyası:

- [.env.production.example](./.env.production.example)

Temel değişken:

- `VITE_API_URL=https://api.example.com`

Build alma:

```bash
npm run build
```

Çıktı klasörü:

- `dist/`

## AWS S3 + CloudFront Deploy

Bu admin panel için önerilen yayın modeli:

- `admin.example.com -> CloudFront -> S3`

Neden:

- panel statik build sonrası dosyalara dönüşüyor
- HTTPS ve custom domain için CloudFront daha temiz
- cache invalidation yapılabiliyor

Bu projede `HashRouter` kullanıldığı için:

- S3/CloudFront tarafında ekstra SPA rewrite kuralı zorunlu değildir
- `index.html` ana giriş dosyası olarak yeterlidir

İlgili router kullanımı:

- [App.tsx](./App.tsx)

### Önerilen AWS Kurulumu

1. S3 bucket oluştur
2. Admin build çıktısını bu bucketa yükle
3. CloudFront distribution oluştur
4. Origin olarak S3 bucket bağla
5. Alternate domain name olarak `admin.example.com` ekle
6. Route 53 ile `admin.example.com` kaydını CloudFront'a yönlendir

### Deploy Script

Hazır PowerShell deploy scripti:

- [deploy-admin.ps1](./scripts/deploy-admin.ps1)

Kullanım:

```powershell
$env:VITE_API_URL="https://api.example.com"
.\scripts\deploy-admin.ps1 -BucketName "your-admin-bucket" -CloudFrontDistributionId "DIST_ID"
```

Script ne yapar:

- `npm ci`
- `npm run build`
- `dist/` klasörünü S3'e sync eder
- istenirse CloudFront invalidation oluşturur

## Notlar

- Admin panelin API adresi `VITE_API_URL` ile belirlenir. Kod tarafı:
  [api.ts](./services/api.ts)
- Admin panel build sonrası Docker gerektirmez; doğrudan S3'e yüklenebilir.
- Gerçek production'da bucket erişimi ve CloudFront tarafı IAM politikalarıyla sınırlandırılmalıdır.
