# CCK Mobilya Backend (API)

## Local Setup (Podman Compose)

1) Create env file:

```bash
cp .env.example .env
```

2) Start Postgres:

```bash
podman-compose up -d
```

3) Create virtualenv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

4) Run migrations:

```bash
alembic upgrade head
```

5) Create admin user (CLI):

```bash
python -m app.scripts.create_admin --email admin@example.com --password "ChangeMe123!"
```

6) Run the API:

```bash
uvicorn app.main:app --reload
```

- Health check: `GET /health`
- Swagger UI: `GET /docs`

## Media Storage

The API now supports two storage backends:

- `STORAGE_BACKEND=local`
  Uploads are written under `MEDIA_ROOT` and served from `/{MEDIA_URL_PREFIX}/...`.
- `STORAGE_BACKEND=s3`
  Uploads are written to `S3_BUCKET_NAME` and public URLs are generated with
  `S3_PUBLIC_BASE_URL` or the default S3 object URL for the configured bucket/region.

Useful env vars:

- `STORAGE_BACKEND=local|s3`
- `MEDIA_ROOT=media`
- `MEDIA_URL_PREFIX=media`
- `APP_BASE_URL=https://api.example.com`
- `CORS_ORIGINS=["https://example.com","https://admin.example.com"]`
- `AWS_REGION=eu-central-1`
- `S3_BUCKET_NAME=your-media-bucket`
- `S3_PUBLIC_BASE_URL=https://your-media-domain`

On AWS EC2, prefer attaching an IAM Role instead of storing access keys in `.env`.

## Tests

```bash
pytest -q
```

## Admin Auth

- Password hashing uses PBKDF2-SHA256 (passlib, pure python).

- Login:

```http
POST /admin/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

- Example protected endpoint:

```http
GET /admin/me
Authorization: Bearer <jwt>
```

## Public API

Public `GET` endpoints support optional language query:

- `?lang=tr` (default)
- `?lang=en`

If English content is missing, API falls back to Turkish content for that field.

- Home:

```http
GET /public/home?lang=en
```

- Products (search + pagination):

```http
GET /public/products?q=koltuk&page=1&page_size=20&lang=en
```

Response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0
}
```

- Product detail:

```http
GET /public/products/{slug}
```

- About:

```http
GET /public/about?lang=en
```

- Quote request:

```http
POST /public/quote-requests
Content-Type: application/json

{
  "name": "Ahmet",
  "phone": "+90 5xx xxx xx xx",
  "email": "a@b.com",
  "message": "Salon takımı için fiyat alabilir miyim?",
  "product_slug": "salon-takimi-x"
}
```

## Admin Product Detail (with images)

```bash
curl -s http://127.0.0.1:8000/admin/products/1 \
  -H "Authorization: Bearer <token>"
```

## Media Upload

```bash
curl -s -X POST http://127.0.0.1:8000/admin/uploads \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

Response:

```json
{
  "uuid": "<uuid4>",
  "url": "/media/YYYY/MM/<uuid4>.jpg"
}
```

When `STORAGE_BACKEND=s3`, the same response shape is preserved, but `url` becomes a public S3 URL.

## SMTP (Quote Requests Email)

Set these env vars to enable email delivery:

- `SMTP_HOST`, `SMTP_PORT`
- `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_TO`
- `SMTP_USE_TLS` (true/false)
- `SMTP_USE_SSL` (true/false)

If `SMTP_HOST` or `SMTP_TO` is not set, email sending is skipped with a log message.

## Nginx Rate Limit (recommended)

```nginx
limit_req_zone $binary_remote_addr zone=quote_limit:10m rate=1r/s;

location /public/quote-requests {
  limit_req zone=quote_limit burst=5 nodelay;
  proxy_pass http://127.0.0.1:8000;
}
```

## Notes
- Singleton rows (`site_settings`, `about_page`) are created on startup if missing.
