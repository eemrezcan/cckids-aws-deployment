# AWS Deployment Plan

## 1. Amaç

Bu dokümanin amacı, `cck-full` içindeki mevcut projeyi:

- teslime uygun,
- videoda rahat anlatılabilir,
- temel bulut kavramlarını gerçekten gösteren,
- ama gereksiz yere karmaşık olmayan

bir AWS yapısına oturtmaktır.

Bu plan iki şeyi aynı anda hedefler:

1. Kısa sürede çalışan bir sistem kurmak
2. Sadece VPS mantığında kalmayıp gerçek cloud kavramlarına giriş yapmak

---

## 2. Mevcut Proje Parçaları

Ana dizindeki mevcut yapı:

- `cck-mobilya-backend-main`
  FastAPI backend
- `cckids-frontend-website-main`
  Next.js web frontend
- `cckids-admin-main`
  Vite tabanlı admin panel

Bu üç parçanın doğası farklıdır:

- Web frontend saf statik değildir, server-side özellik kullanır
- Backend API ve veri katmanıdır
- Admin panel build sonrası statik dosya olarak sunulabilir

Bu yüzden hepsini aynı şekilde deploy etmek yerine, her parçayı en uygun yere koymak gerekir.

---

## 3. Önerilen AWS Mimarisi

Bu proje için önerilen ilk AWS mimarisi:

- `EC2`
- `RDS PostgreSQL`
- `S3`
- `IAM Role`
- `Security Groups`
- `CloudWatch`

İsteğe bağlı ama güzel ekler:

- `Route 53`
- `ACM`
- `CloudFront`

Bu ilk teslim için zorunlu olmayanlar:

- `ECR`
- `ECS`
- `EKS`
- `Lambda`
- `ALB`

Bu seçim bilinçlidir. Amaç, gerçek cloud mantığını görmek; ama süreyi boğmamak.

---

## 4. Çok Basit Dille Servisler Ne İşe Yarar

### EC2

Buluttaki sunucudur.

Çok basit düşün:

- VPS gibi bir makine
- İçine bağlanırsın
- Uygulama çalıştırırsın
- Docker kurarsın

Bu projede EC2 üzerinde çalışacak parçalar:

- Next.js web frontend
- FastAPI backend
- Nginx

---

### RDS PostgreSQL

AWS'in hazır veritabanı hizmetidir.

Çok basit düşün:

- Veritabanını EC2 içine kurmuyorsun
- AWS sana ayrı bir veritabanı veriyor
- Yedek, bakım, yönetim tarafı daha düzgündür

Bu projede RDS'nin rolü:

- Backend'in PostgreSQL veritabanı olmak

---

### S3

AWS'in dosya/obje depolama hizmetidir.

Çok basit düşün:

- İnternet üstündeki dosya dolabı
- Statik dosya koyarsın
- Görsel koyarsın
- İleride medya dosyaları koyarsın

Bu projede S3'nin rolleri:

- Admin panelin statik build çıktısını yayınlamak
- Yüklenen görselleri ve medya dosyalarını burada tutmak

Bu planda S3 artık sadece ek bir servis değil, mimarinin ana parçalarından biridir.

---

### IAM Role

Yetki sistemidir.

Çok basit düşün:

- EC2'nin AWS servislerine erişmek için gizli anahtar taşımaması
- Onun yerine AWS'in "bu sunucu şu servise erişebilir" demesi

Bu projede rolü:

- EC2'nin ileride S3'e güvenli erişebilmesi

---

### Security Group

AWS tarafındaki güvenlik duvarıdır.

Çok basit düşün:

- Hangi kapılar açık?
- Hangi kapılar kapalı?

Bu projede:

- SSH için `22`
- HTTP için `80`
- HTTPS için `443`

RDS için ise:

- `5432` sadece EC2'den erişilebilir olacak

---

### CloudWatch

Log ve izleme sistemidir.

Çok basit düşün:

- Hata oldu mu?
- Servis ayakta mı?
- Ne log üretti?

İlk aşamada:

- En azından backend loglarını takip etmek için kullanılabilir

---

## 5. Bu Projede Parça Parça Nereye Ne Gidecek

### 5.1 Web Frontend

Klasör:

- `cckids-frontend-website-main`

Deploy yeri:

- `EC2`

Neden:

- Next.js burada saf statik site değil
- Server-side route ve env bağımlılığı var
- Bu yüzden S3'e düz `index.html` gibi koymak doğru değil

Çalışma şekli:

- Docker container içinde
- Nginx üzerinden dışarı açılacak

---

### 5.2 Backend

Klasör:

- `cck-mobilya-backend-main`

Deploy yeri:

- `EC2`

Neden:

- API burada çalışıyor
- Docker tabanına zaten yakın
- EC2 üstünde container olarak çalıştırmak mantıklı

Çalışma şekli:

- Docker container
- Nginx ters proxy ile dışarı açılacak
- Veritabanına RDS üzerinden bağlanacak

---

### 5.3 Admin Panel

Klasör:

- `cckids-admin-main`

Deploy yeri:

- `S3 static hosting`

Neden:

- Vite tabanlı
- Build sonrası statik dosyaya dönüşebilir
- Bu da S3 için çok uygun
- Böylece projede gerçekten S3 kullanmış oluruz

Bu seçim aynı zamanda videoda anlatmak için güzeldir:

- "Web tarafı dinamik olduğu için EC2"
- "Admin panel statik olduğu için S3"

---

### 5.4 Veritabanı

Deploy yeri:

- `RDS PostgreSQL`

Neden:

- Bu bizi EC2 içine DB kurma mantığından çıkarır
- Gerçek cloud ayrımını gösterir
- Sunucu ile veriyi ayırmış oluruz

---

### 5.5 Media Dosyaları

Deploy yeri:

- `S3`

Çalışma mantığı:

- Admin panel kullanıcıdan dosyayı seçer
- Backend upload isteğini alır
- Backend dosyayı S3'e yükler
- Backend ilgili URL veya key bilgisini veritabanına yazar
- Web frontend ve admin panel bu görseli S3 URL'si üzerinden gösterir

Bu seçimin faydası:

- Medya dosyaları uygulama sunucusundan ayrılır
- Gerçek object storage mantığı görülür
- "Sunucu çökerse dosyalar da gider" riski azalır
- Videoda S3'ün gerçek kullanımını göstermek kolaylaşır

Not:

- Mevcut kod bunu şu anda tam desteklemiyor
- Repo tarafında ek geliştirme gerekecek
- Ama mimari hedef artık nettir: medya dosyaları lokal disk yerine S3'te olacak

---

## 6. Önerilen URL Yapısı

### Tercih Edilen Yapı

- `https://ornekalanadi.com` -> web frontend
- `https://api.ornekalanadi.com` -> backend API
- `https://admin.ornekalanadi.com` -> admin panel
- `https://media.ornekalanadi.com/...` -> görseller/media, istenirse ikinci aşamada

Eğer domain varsa en temiz yapı:

- kök domain veya `www`
- `api`
- `admin`

şeklinde ayırmaktır.

### Bu Proje İçin Net Domain Kararı

Bu proje için önerilen gerçek kullanım:

- `ornekalanadi.com`
  Next.js web sitesi
- `api.ornekalanadi.com`
  FastAPI backend
- `admin.ornekalanadi.com`
  Admin panel

Bu yapı mantıklıdır çünkü:

- web ile admin farklı uygulamalardır
- admin panel içerik yönetir ama public site olmak zorunda değildir
- route karmaşası azalır
- `/admin` alt path kullanımı ve Vite `base` problemi büyük ölçüde ortadan kalkar
- videoda mimariyi anlatmak daha kolay olur

### Bu Domainler AWS'te Nereye Gidecek

- `ornekalanadi.com`
  `Route 53 -> EC2 Elastic IP -> Nginx -> Next.js`
- `api.ornekalanadi.com`
  `Route 53 -> EC2 Elastic IP -> Nginx -> FastAPI`
- `admin.ornekalanadi.com`
  `Route 53 -> CloudFront -> S3`
- `media.ornekalanadi.com`
  `Route 53 -> CloudFront -> S3`

Burada önemli not:

- admin paneli sadece düz `S3 website endpoint` ile vermek mümkündür
- ama S3 website endpoint HTTPS desteklemez
- bu yüzden doğru ve temiz çözüm `CloudFront + S3` kullanmaktır
- aynı mantık media dosyaları için de geçerlidir
- görselleri doğrudan S3 object URL ile vermek mümkündür
- ama temiz custom domain, cache ve HTTPS için önerilen çözüm `CloudFront + S3` olur

İlk teslim çok sıkışıksa geçici olarak:

- admin panel `S3 website endpoint` üzerinden açılabilir
- media dosyaları da geçici olarak doğrudan S3 object URL ile sunulabilir

Ama önerilen ve videoda daha güçlü görünen mimari:

- `admin.ornekalanadi.com -> CloudFront -> S3`
- `media.ornekalanadi.com -> CloudFront -> S3`

### Domain Yoksa Geçici Yapı

- `http://EC2_PUBLIC_IP` -> web
- `http://EC2_PUBLIC_IP/api/...` veya `http://EC2_PUBLIC_IP:8000`
- `http://S3_WEBSITE_ENDPOINT` -> admin
- `https://S3_OBJECT_URL/...` -> media dosyaları

İlk demo için bu da yeterlidir.

---

## 7. Ağ ve Port Yapısı

### Dış dünyaya açık olacaklar

- `22` -> SSH
- `80` -> HTTP
- `443` -> HTTPS, varsa

### İçeride kullanılacaklar

- `3000` -> Next.js app container
- `8000` -> FastAPI app container
- `5432` -> PostgreSQL

Not:

- `3000` ve `8000` doğrudan internete açılmak zorunda değil
- Nginx bunlara içeriden erişip dışarıya tek giriş noktası olabilir

### RDS güvenlik mantığı

- RDS dış dünyaya açık olmayacak
- Sadece EC2 güvenlik grubundan erişim verilecek

Bu önemli bir temel cloud prensibidir:

- Sunucu dışarı açık olabilir
- Veritabanı doğrudan herkese açık olmaz

---

## 8. Docker Tarafında Nasıl Düşüneceğiz

Bu plan içinde önerilen container düzeni:

- `web`
- `api`
- `nginx`

İlk teslim için admin panel container olmak zorunda değildir çünkü S3'e statik olarak gidecek.

Yani EC2 içindeki çalışma mantığı:

- Docker Compose
- Üç container
- Nginx gelen isteği ilgili servise yönlendirir

Çok basit akış:

- Kullanıcı web sitesine gelir
- Nginx web container'a yollar
- Web gerektiğinde API'ye istek atar
- API RDS'den veri çeker

---

## 9. Ortam Degiskenleri Mantığı

Bu bölüm çok önemlidir. Çünkü local ile cloud arasındaki en büyük farklardan biri budur.

### Web Frontend

Gereken temel env'ler:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_GENAI_API_KEY`

Anlamları:

- API nerede?
- Sitenin gerçek public adresi ne?
- AI özelliği için anahtar ne?

### Admin Panel

Gereken temel env:

- `VITE_API_URL`

Anlamı:

- Admin panel hangi API'ye bağlanacak?

### Backend

Gereken temel env'ler:

- `APP_ENV`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `APP_BASE_URL`
- `JWT_SECRET_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `S3_PUBLIC_BASE_URL` veya eşdeğer public media adresi
- SMTP ayarları gerekiyorsa mail env'leri

Anlamları:

- Uygulama prod mu dev mi?
- Veritabanı nereye bağlanacak?
- Hangi origin'lerden erişime izin verilecek?
- API'nin public adresi ne?
- Dosyalar hangi bucket'a yüklenecek?
- Dışarıya hangi media adresi dönecek?

---

## 10. Somut Kurulum Sirasi

Bu sırayla gidersek iş dağılmaz.

### Adım 1

AWS hesabı hazırlanır.

Yapılacaklar:

- Root hesap açılır
- Günlük iş için IAM user oluşturulur
- Mümkünse MFA açılır

Neden:

- Root hesap anahtar gibidir
- Günlük işte root kullanmak doğru değildir

### Adım 2

Region seçilir.

Öneri:

- Tek bir region seç ve her şeyi orada kur

Neden:

- Karışıklık azalır
- Kaynakları bulmak kolay olur

### Adım 3

RDS PostgreSQL kurulur.

Yapılacaklar:

- DB instance oluştur
- Kullanıcı/şifre belirle
- Security group'u sadece EC2'ye izin verecek şekilde ayarla

### Adım 4

S3 bucket hazırlanır.

Yapılacaklar:

- Admin panel için bucket oluştur
- Media dosyaları için bucket oluştur
- Admin bucket'ta static website hosting aç
- Admin için CloudFront distribution hazırla
- Media bucket için CloudFront distribution hazırla
- Media bucket için gerekli public erişim veya kontrollü erişim modelini belirle

### Adım 5

EC2 kurulur.

Yapılacaklar:

- Ubuntu makine aç
- Security group ayarla
- SSH ile bağlan

### Adım 6

EC2 içine temel araçlar kurulur.

Yapılacaklar:

- Docker
- Docker Compose
- Git

### Adım 7

Repo sunucuya alınır ve production dosyaları hazırlanır.

Yapılacaklar:

- Dockerfile'lar
- docker-compose prod dosyası
- Nginx config
- env dosyaları
- backend için S3 upload entegrasyonu

### Adım 8

Web ve backend EC2 üstünde ayağa kaldırılır.

### Adım 9

Admin panel build alınır ve `S3 + CloudFront` üzerinden yayınlanır.

### Adım 10

Media upload akışı S3 ile test edilir.

### Adım 11

Sistem uçtan uca test edilir.

---

## 11. 8 Saatlik Gerçekçi Yol Haritasi

### 0-1 saat

- AWS servislerini netleştir
- hesap ve güvenlik hazırlığı

### 1-2 saat

- RDS ve S3 kur

### 2-3 saat

- EC2 kur ve bağlan

### 3-5 saat

- Docker/Nginx/deploy hazırlığı
- backend medya akışını S3 hedefli hale getirme

### 5-6.5 saat

- Web + backend ayağa kaldır

### 6.5-7.5 saat

- Admin build + S3 yayın
- media upload testi

### 7.5-8 saat

- Test
- video için not çıkarma

---

## 12. Videoda Neleri Anlatacagim

Bu plan video çekimi için de düşünülmüştür.

10 dakikalık video için anlatım sırası:

1. Projenin amacı
2. Sistemin parçaları
3. Neden AWS seçildi
4. EC2 nedir
5. RDS nedir
6. S3 nedir
7. Güvenlik grubu nedir
8. Web frontend neden EC2'de
9. Admin neden S3'te
10. Medya dosyaları neden S3'te
11. API ve DB nasıl konuşuyor
12. Kısa canlı demo
13. Gelecekte bu mimari nasıl büyür

---

## 13. Gelecekte Bu Yapı Nasıl Büyür

İlk teslim sonrası olası gelişim:

- CloudFront eklemek
- Domain'i Route 53 ile bağlamak
- HTTPS için ACM kullanmak
- CI/CD kurmak
- ECR ve ECS'e geçmek

Yani bu plan bir çıkmaz sokak değildir.
Tam tersine, ileri cloud yapısına geçiş için düzgün bir ilk basamaktır.

---

## 14. Simdilik Kullanmayacagimiz Servisler

### ECS / EKS

Çok güçlü ama ilk teslim için gereksiz derecede ağır.

### ECR

Güzel ama ilk teslim için şart değil.
Image'ları sunucuda build etmek daha hızlı olabilir.

### Lambda

Bu proje doğrudan Lambda'ya uygun bir yapı değil.

### ALB

Tek sunucu senaryosunda şart değil.

### CloudFront

Güzel ama ilk teslim için opsiyonel.
Sonradan eklenebilir.

---

## 15. Bu Planin Kisa Ozeti

Bu proje için ilk AWS kurulumu şu olacak:

- `EC2`
  web + backend + nginx
- `RDS`
  PostgreSQL
- `S3`
  admin panel + media dosyaları
- `IAM Role`
  güvenli servis erişimi
- `Security Group`
  ağ güvenliği
- `CloudWatch`
  log ve izleme

Bu mimari:

- sadece VPS kurmak değildir
- ama gereksiz derecede ağır da değildir
- bulut mantığını gerçekten gösterir
- teslime uygundur
- videoda iyi anlatılır

---

## 16. Sonraki Asama

Bu dokümandan sonraki iş:

- mevcut repoyu tek tek incelemek
- hangi Dockerfile'lar lazım belirlemek
- hangi env'ler eksik belirlemek
- admin panelin S3'e uygun hale gelmesi için gereken değişiklikleri belirlemek
- Nginx route planını netleştirmek
- deployment dosyalarını hazırlamak

Bu noktadan sonra odak:

- teori değil
- mevcut koda göre yapılacak somut iş listesi

olacaktır.

---

## 17. Resmi AWS Kaynaklari

- EC2: https://aws.amazon.com/ec2/
- RDS PostgreSQL: https://aws.amazon.com/rds/postgresql/
- S3: https://aws.amazon.com/s3/
- IAM: https://aws.amazon.com/iam/
- VPC: https://aws.amazon.com/vpc/
- CloudWatch: https://aws.amazon.com/cloudwatch/

---

## 18. Deployment Dosyalari Taslagi

Bu bölüm artık teoriden uygulamaya geçerken oluşturacağımız production dosyalarını tanımlar.

### 18.1 Uretilecek Production Dosyalari

- `cck-mobilya-backend-main/Dockerfile`
- `cck-mobilya-backend-main/.dockerignore`
- `cckids-frontend-website-main/Dockerfile`
- `cckids-frontend-website-main/.dockerignore`
- `docker-compose.prod.yml`
- `nginx/default.conf`

Admin panel için bu aşamada Dockerfile zorunlu değildir çünkü:

- admin `S3 + CloudFront` ile yayınlanacak

### 18.2 docker-compose.prod.yml Mantigi

Production compose içinde sadece şu servisler olacak:

- `api`
- `web`
- `nginx`

Bilerek olmayacak servisler:

- `db`
- `admin`
- `redis`

Çünkü:

- veritabanı `RDS`
- admin `S3 + CloudFront`
- redis şu aşamada gerekli değil

Akış:

- `ornekalanadi.com -> nginx -> web`
- `api.ornekalanadi.com -> nginx -> api`

### 18.3 Backend Dockerfile Taslagi

Backend image için hedef yapı:

- base image: `python:3.11-slim`
- workdir: `/app`
- requirements kurulacak
- `alembic.ini`, `alembic/`, `app/` kopyalanacak
- non-root user kullanılacak
- varsayılan çalışma komutu `uvicorn` olacak

Örnek mantık:

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY alembic.ini .
COPY alembic ./alembic
COPY app ./app

RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Production compose içinde bu komut gerektiğinde override edilecek:

```yaml
command: >
  sh -c "alembic upgrade head &&
         uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

### 18.4 Backend .dockerignore Mantigi

Backend image içine gereksiz dosyalar girmemeli.

Önerilen örnek:

```gitignore
.venv
__pycache__
.pytest_cache
*.pyc
.env
.env.*
media
tests
```

### 18.5 Siradaki Adimlar

Bu bölümden sonra sırayla:

1. `web Dockerfile`
2. `docker-compose.prod.yml`
3. `nginx/default.conf`
4. env yerleşimi

planlanacak ve ardından uygulanacaktır.

### 18.6 Web Dockerfile Taslagi

Web frontend burada `Next.js` olarak Node runtime üzerinde çalışacaktır.

Bu yüzden:

- statik export yapılmayacak
- `next build` alınacak
- production'da `next start` çalışacak

Önerilen yapı:

- base image: `node:20-alpine`
- multi-stage build
- runtime image daha küçük tutulacak
- non-root user kullanılacak

Örnek mantık:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
```

Bu Dockerfile'ın compose ile ilişkisi:

- build arg olarak:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
- runtime env olarak:
  - `GOOGLE_GENAI_API_KEY`

### 18.7 Web .dockerignore Mantigi

Önerilen örnek:

```gitignore
node_modules
.next
.env
.env.*
npm-debug.log
```

### 18.8 Sonraki Siradaki Parca

Bu noktadan sonra sıradaki somut plan:

- `docker-compose.prod.yml`
- ardından `nginx/default.conf`

### 18.9 docker-compose.prod.yml Taslagi

Production compose dosyası ana dizinde tutulacaktır:

- `docker-compose.prod.yml`

Bu dosyanın amacı:

- EC2 içinde `web`, `api` ve `nginx` servislerini birlikte ayağa kaldırmak
- dış dünyaya sadece `nginx` açmak
- `RDS` ve `S3` kullanan production mimarisini sabitlemek

Bu compose içinde bilerek olmayacaklar:

- `db`
- `admin`
- `redis`

Çünkü:

- veritabanı `RDS`
- admin panel `S3 + CloudFront`
- redis şu aşamada gerekli değil

Önerilen taslak:

```yaml
services:
  api:
    build:
      context: ./cck-mobilya-backend-main
    container_name: cck_api
    env_file:
      - ./cck-mobilya-backend-main/.env.prod
    command: >
      sh -c "alembic upgrade head &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000"
    expose:
      - "8000"
    restart: unless-stopped
    networks:
      - app_net

  web:
    build:
      context: ./cckids-frontend-website-main
      args:
        NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    container_name: cck_web
    environment:
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      GOOGLE_GENAI_API_KEY: ${GOOGLE_GENAI_API_KEY}
      PORT: 3000
    expose:
      - "3000"
    restart: unless-stopped
    networks:
      - app_net
    depends_on:
      - api

  nginx:
    image: nginx:1.27-alpine
    container_name: cck_nginx
    depends_on:
      - web
      - api
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    restart: unless-stopped
    networks:
      - app_net

networks:
  app_net:
    driver: bridge
```

Bu taslakta önemli noktalar:

- `api` ve `web` dışarı port açmaz
- sadece `nginx` internete açılır
- `alembic upgrade head` başlangıçta çalıştırılır
- `web` build sırasında `NEXT_PUBLIC_*` değişkenlerini alır

### 18.10 nginx/default.conf Taslagi

Nginx'in görevi:

- `ornekalanadi.com` isteklerini `web` servisine iletmek
- `www.ornekalanadi.com` isteklerini kök domaine yönlendirmek
- `api.ornekalanadi.com` isteklerini `api` servisine iletmek

Önerilen temel mantık:

```nginx
server {
    listen 80;
    server_name www.ornekalanadi.com;
    return 301 https://ornekalanadi.com$request_uri;
}

server {
    listen 80;
    server_name ornekalanadi.com;
    return 301 https://ornekalanadi.com$request_uri;
}

server {
    listen 80;
    server_name api.ornekalanadi.com;
    return 301 https://api.ornekalanadi.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ornekalanadi.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.ornekalanadi.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    client_max_body_size 100M;

    location / {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Bu taslakta dikkat edilmesi gerekenler:

- upload için `client_max_body_size 100M` eklenmeli
- `www` kök domaine yönlendirilmeli
- web ve api farklı host ile ayrılmalı
- gerçek sertifika dosyaları sonradan yerleştirilecek

### 18.11 Env Yerlesimi Mantigi

Bu production yapıda env yerleşimi şu şekilde olabilir:

- `cck-mobilya-backend-main/.env.prod`
  backend için
- ana dizinde `.env.prod.compose`
  compose interpolation ve web env'leri için

Örnek olarak compose tarafında tutulacak kritik değişkenler:

- `NEXT_PUBLIC_API_BASE_URL=https://api.ornekalanadi.com`
- `NEXT_PUBLIC_SITE_URL=https://ornekalanadi.com`
- `GOOGLE_GENAI_API_KEY=...`

Backend `.env.prod` tarafında tutulacak kritik değişkenler:

- `APP_ENV=prod`
- `DATABASE_URL=...`
- `CORS_ORIGINS=https://ornekalanadi.com,https://admin.ornekalanadi.com`
- `APP_BASE_URL=https://api.ornekalanadi.com`
- `JWT_SECRET_KEY=...`
- `STORAGE_BACKEND=s3`
- `AWS_REGION=...`
- `S3_BUCKET_NAME=...`
- `S3_PUBLIC_BASE_URL=https://media.ornekalanadi.com`

### 18.12 Bu Planin Sonraki Uygulama Adimi

Bu noktadan sonra istersek artık planlamayı bırakıp dosyaları gerçekten üretebiliriz:

1. backend `Dockerfile` ve `.dockerignore`
2. web `Dockerfile` ve `.dockerignore`
3. `docker-compose.prod.yml`
4. `nginx/default.conf`
