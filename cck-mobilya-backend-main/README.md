# CCK Backend API

Bu servis, CCK Kids monorepo içindeki FastAPI tabanlı backend katmanıdır. Public web uygulaması ile admin panel aynı veri kaynağını bu API üzerinden kullanır.

## Sorumlulukları

- public içerik endpoint'lerini sunmak
- admin CRUD işlemlerini yönetmek
- JWT tabanlı admin doğrulaması sağlamak
- PostgreSQL veri modelini yönetmek
- local veya S3 tabanlı medya yükleme akışını desteklemek
- teklif taleplerini ve içerik yapılarını merkezi olarak işlemek

## Temel Yapı

```text
app/
├─ main.py
├─ models.py
├─ routers/
├─ schemas/
├─ services/
└─ scripts/
```

## Gereksinimler

- Python 3.11+
- PostgreSQL
- `pip`

## Ortam Değişkenleri

Başlangıç için örnek dosya:

- [.env.example](./.env.example)

Sık kullanılan değişkenler:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `JWT_SECRET_KEY`
- `STORAGE_BACKEND=local|s3`
- `MEDIA_ROOT`
- `MEDIA_URL_PREFIX`
- `APP_BASE_URL`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `S3_PUBLIC_BASE_URL`

## Lokal Geliştirme

1. Örnek env dosyasını kopyala:

```bash
cp .env.example .env
```

2. Bağımlılıkları kur:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

3. Veritabanını hazırla ve migration çalıştır:

```bash
alembic upgrade head
```

4. İstersen admin kullanıcı oluştur:

```bash
python -m app.scripts.create_admin --email admin@example.com --password "ChangeMe123!"
```

5. API'yi başlat:

```bash
uvicorn app.main:app --reload
```

Varsayılan yardımcı uçlar:

- Health: `GET /health`
- Swagger UI: `GET /docs`

## Docker ile Lokal Çalışma

Bu servis, kök dizindeki `docker-compose.local.yml` içinde `api` servisi olarak çalıştırılır. Compose akışında:

- migration otomatik uygulanır
- local storage için `media/` klasörü mount edilir
- `ROOT_PATH=/api` ile Nginx arkasında servis edilir

## Medya Katmanı

Backend iki farklı medya backend'ini destekler:

- `STORAGE_BACKEND=local`
  Dosyalar local `media/` altında tutulur.
- `STORAGE_BACKEND=s3`
  Dosyalar S3 bucket'a yazılır ve public URL üretilir.

Amaç, aynı API sözleşmesini koruyarak local ve cloud ortamlarında farklı storage stratejileri kullanabilmektir.

## Test

```bash
pytest -q
```

## Notlar

- `site_settings` ve `about_page` gibi singleton kayıtlar startup sırasında seed edilir.
- Production ortamında AWS access key yerine mümkünse IAM Role tercih edilmelidir.
