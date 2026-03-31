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

## Sonraki Adım

Bu repo, EC2 deploy ve AWS kurulumuna hazırlanmış durumdadır. Somut kurulum planı için:

- [AWS_DEPLOYMENT_PLAN.md](./AWS_DEPLOYMENT_PLAN.md)
