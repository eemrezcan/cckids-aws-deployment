# CCK Full

Bu repo, CCK Kids / CCK Mobilya projesinin cloud-ready monorepo halidir.

İçerik:

- `cck-mobilya-backend-main`
  FastAPI backend
- `cckids-frontend-website-main`
  Next.js web frontend
- `cckids-admin-main`
  Vite tabanlı admin panel
- `AWS_DEPLOYMENT_PLAN.md`
  AWS mimarisi, domain yapısı ve deployment planı

## Hedef Mimari

- `example.com`
  Next.js web
- `api.example.com`
  FastAPI API
- `admin.example.com`
  Admin panel, `S3 + CloudFront`
- `media.example.com`
  Görseller, `S3 + CloudFront`

## AWS Bileşenleri

- `EC2`
  web + api + nginx
- `RDS PostgreSQL`
  veritabanı
- `S3`
  admin build ve medya dosyaları
- `CloudFront`
  admin ve medya dağıtımı

## Repo Notları

- Gerçek `.env` dosyaları repoya dahil edilmez
- Örnek env dosyaları `*.example` olarak tutulur
- Ders PDF'leri public repoya dahil edilmez

## Lokal Smoke Test

AWS'e cikmadan once repo lokal olarak Docker ile test edilebilir.

Ana dosyalar:

- `docker-compose.local.yml`
- `nginx/default.local.conf`
- `.env.local.compose.example`

Hizli baslangic:

1. Istersen `.env.local.compose.example` dosyasini `.env.local.compose` olarak kopyala ve degerleri guncelle.
2. Asagidaki komutu calistir:

```powershell
docker compose --env-file .env.local.compose -f docker-compose.local.yml up --build
```

Env dosyasi olusturmak istemezsen varsayilan degerlerle su komut da calisir:

```powershell
docker compose -f docker-compose.local.yml up --build
```

Lokal URL:

- `http://localhost:8080`

Lokal stack:

- `web`
  Next.js frontend
- `api`
  FastAPI backend
- `db`
  PostgreSQL
- `nginx`
  lokal reverse proxy

Not:

- Lokal stack'te medya `local storage` ile calisir
- Lokal stack'te image optimization kapatilabilir; bu, `localhost` altinda smoke test'i kolaylastirmak icindir

## Sonraki Adım

Bu repo, EC2 deploy ve AWS kurulumuna hazırlanmış durumdadır. Somut kurulum planı için:

- [AWS_DEPLOYMENT_PLAN.md](./AWS_DEPLOYMENT_PLAN.md)
