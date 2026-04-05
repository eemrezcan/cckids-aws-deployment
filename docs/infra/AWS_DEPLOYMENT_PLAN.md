# AWS Deployment Plan

## 1. Amaç

Bu dokümanın amacı, `cck-full` reposundaki mevcut yapının AWS üzerinde nasıl konumlandığını netleştirmektir. Bu dosya artık yalnızca fikir aşamasındaki bir öneri listesi değil; mevcut repo yapısında gerçekten desteklenen production mimarisini açıklayan bir referans dokümandır.

Özellikle şu ayrımı netleştirir:

- repo tarafında hangi parçalar zaten hazır
- AWS tarafında hangi servisler bu yapının gerçek karşılığı
- hangi başlıkların mevcut mimarinin parçası olduğu
- hangi başlıkların ise hâlâ opsiyonel veya ileri seviye geliştirme olduğu

## 2. Mevcut Repo Gerçeği

Monorepo içindeki üç ana uygulama şunlardır:

- `cck-mobilya-backend-main`
  FastAPI tabanlı backend API
- `cckids-frontend-website-main`
  Next.js tabanlı public web uygulaması
- `cckids-admin-main`
  Vite tabanlı admin panel

Bu üç parçanın üretim ortamındaki doğası aynı değildir:

- public web uygulaması Node runtime gerektirdiği için statik site gibi ele alınmaz
- backend API uygulama ve veri erişim katmanıdır
- admin panel build sonrası statik dosyaya dönüşebilir

Bu nedenle mevcut production yaklaşımı şu ayrımı kullanır:

- web + api + nginx -> `EC2`
- veritabanı -> `RDS PostgreSQL`
- admin panel statik yayını -> `S3 + CloudFront`
- medya dosyaları -> `S3 + CloudFront`
- web ve API giriş katmanı -> `CloudFront -> EC2`

Buradaki kritik güncelleme şudur: bu repo yapısında `CloudFront`, artık “ileride eklenebilir güzel bir şey” olarak değil; web, API, admin panel ve medya dağıtımı için mevcut önerilen canlı mimarinin parçası olarak düşünülmelidir.

## 3. Güncel Production Mimarisi

Önerilen ve repo ile uyumlu production mimarisi aşağıdaki gibidir:

- `https://example.com`
  Public web uygulaması, `CloudFront -> EC2`
- `https://api.example.com`
  Backend API, `CloudFront -> EC2`
- `https://admin.example.com`
  Admin panel, `CloudFront -> S3`
- `https://media.example.com`
  Medya dosyaları, `CloudFront -> S3`

Mantıksal akış:

- kullanıcı public siteye gider
- istek önce CloudFront katmanına gelir
- public site gerekli verileri backend API'den alır
- API istekleri de CloudFront üzerinden EC2 üzerindeki Nginx/API zincirine ulaşır
- backend verileri `RDS PostgreSQL` üzerinden okur
- medya dosyaları `S3` üzerinde tutulur
- medya public erişimde `CloudFront` üzerinden sunulur
- admin panel statik build olarak `S3`'e yüklenir ve `CloudFront` üzerinden yayınlanır

Kısa mimari özeti:

```text
Internet
 ├─ example.com          -> CloudFront -> EC2 -> Nginx -> Next.js
 ├─ api.example.com      -> CloudFront -> EC2 -> Nginx -> FastAPI
 ├─ admin.example.com    -> CloudFront -> S3
 └─ media.example.com    -> CloudFront -> S3

FastAPI -> RDS PostgreSQL
FastAPI -> S3 (upload)
```

## 4. AWS Servisleri ve Bu Projedeki Rolleri

### EC2

EC2, uygulama katmanının çalıştığı sunucudur. Bu projede aşağıdaki parçalar EC2 üzerinde çalışır:

- Next.js public web
- FastAPI backend
- Nginx reverse proxy

Repo tarafındaki karşılığı:

- `docker-compose.prod.yml`
- `nginx/default.conf`
- backend ve web Dockerfile'ları

### RDS PostgreSQL

RDS, veritabanı katmanını uygulama sunucusundan ayırır. Backend bu servise `DATABASE_URL` üzerinden bağlanır.

Repo tarafındaki karşılığı:

- `cck-mobilya-backend-main/.env.prod.example`

### S3

S3 bu projede iki ana amaçla kullanılır:

1. Admin panelin statik build çıktısını barındırmak
2. Medya dosyalarını saklamak

Bu artık teorik bir hedef değil; repo içindeki admin deploy script'i ve backend medya katmanı bu kullanım modelini desteklemektedir.

### CloudFront

CloudFront bu projede üç ayrı yayın katmanında düşünülmelidir:

1. Web ve API isteklerinin EC2 üzerindeki Nginx origin'ine ulaşması
2. Admin panelin custom domain ve HTTPS ile yayınlanması
3. Medya dosyalarının `media.example.com` gibi temiz bir alan adı üzerinden sunulması

Özellikle medya tarafında backend'in döndürdüğü public URL, `S3_PUBLIC_BASE_URL` üzerinden belirlenir. Bu değer doğrudan CloudFront domain'i veya CloudFront'a bağlı özel domain olabilir.

Yani burada CloudFront artık “gelecekte eklenecek performans katmanı” değildir; repo tasarımı içinde web, API, admin ve medya için doğrudan kullanılan public dağıtım katmanıdır.

### IAM Role

EC2'nin S3 gibi AWS servislerine erişirken access key taşımadan çalışabilmesi için IAM Role önerilir. Repo access key ile de çalışabilir; ancak production için role tabanlı kullanım daha güvenlidir.

### Security Groups

Security Group tarafında temel mantık:

- `22` -> SSH
- `80` -> HTTP
- `443` -> HTTPS, eğer EC2 üzerinde terminate edilecekse
- `5432` -> yalnızca uygulama sunucusundan RDS erişimi

### Diğer Servisler

Aşağıdaki servisler faydalıdır ancak mevcut repo yapısında zorunlu değildir:

- `Route 53`
- `ACM`
- `CloudWatch`

Bu servisler altyapıyı güçlendirir ama repo içindeki uygulama mantığının temel parçası değildir.

## 5. Repo İçinde Bu Mimarinin Karşılıkları

Mevcut production akışını destekleyen başlıca dosyalar şunlardır:

### Production compose

- `docker-compose.prod.yml`

Bu dosyada yalnızca şu servisler vardır:

- `api`
- `web`
- `nginx`

Bilerek olmayan servisler:

- `db`
- `admin`

Çünkü:

- veritabanı `RDS` olarak düşünülür
- admin panel `S3 + CloudFront` üzerinden yayınlanır

### Nginx routing

- `nginx/default.conf`

Bu dosya host bazlı ayrım yapar:

- `example.com` -> web
- `api.example.com` -> api

Production anlatımında bu Nginx katmanının önünde ayrıca CloudFront bulunduğu varsayılır. Yani public web ve API istekleri önce CloudFront'a, oradan EC2 üzerindeki Nginx origin'ine ulaşır.

Not: mevcut repo içindeki bu Nginx konfigürasyonu yalnızca `HTTP` için örneklenmiştir. HTTPS terminate edilmesi gerekiyorsa ya Nginx konfigürasyonu genişletilmeli ya da TLS başka bir katmanda çözülmelidir.

### Admin deploy script

- `cckids-admin-main/scripts/deploy-admin.ps1`

Bu script:

- `npm ci`
- `npm run build`
- `aws s3 sync`
- isteğe bağlı `CloudFront invalidation`

işlemlerini yapar.

Bu da admin panel için `S3 + CloudFront` yaklaşımının repo içinde gerçekten desteklendiğini gösterir.

### Backend medya katmanı

- `cck-mobilya-backend-main/app/services/media_utils.py`

Bu dosya:

- `local` storage
- `s3` storage

arasında seçim yapabilir. Ayrıca `S3_PUBLIC_BASE_URL` üzerinden public medya URL'si üretir. Bu, medya alanının doğrudan CloudFront üzerinden sunulmasını mümkün kılar.

## 6. Ortam Değişkeni Matrisi

### Root compose tarafı

`.env.prod.compose.example` içindeki temel değişkenler:

- `NEXT_PUBLIC_API_BASE_URL=https://api.example.com`
- `NEXT_PUBLIC_SITE_URL=https://example.com`
- `NEXT_PUBLIC_MEDIA_BASE_URL=https://media.example.com`
- `INTERNAL_API_BASE_URL=`
- `NEXT_DISABLE_IMAGE_OPTIMIZATION=false`
- `GOOGLE_GENAI_API_KEY=`

Burada özellikle önemli olan nokta:

- `NEXT_PUBLIC_MEDIA_BASE_URL` medya dosyalarının public çözümü için vardır
- media alanı doğrudan CloudFront domain'i olabilir

### Backend production env

`cck-mobilya-backend-main/.env.prod.example` içindeki temel değişkenler:

- `APP_ENV=prod`
- `ROOT_PATH=/api`
- `DATABASE_URL=...`
- `CORS_ORIGINS=["https://example.com","https://admin.example.com"]`
- `STORAGE_BACKEND=s3`
- `APP_BASE_URL=https://api.example.com`
- `AWS_REGION=eu-central-1`
- `S3_BUCKET_NAME=example-media-bucket`
- `S3_PUBLIC_BASE_URL=https://media.example.com`

Buradaki kritik gerçek şudur:

- medya akışı zaten `s3` desteklemektedir
- public media adresi zaten custom domain / CloudFront mantığına göre verilebilmektedir

### Admin panel env

Admin panel için temel production değişkeni:

- `VITE_API_URL=https://api.example.com`

## 7. Güncel Deployment Sırası

Bu repo ile uyumlu kurulum sırası aşağıdaki gibidir:

### Adım 1

`RDS PostgreSQL` instance oluşturulur.

### Adım 2

İki ayrı `S3` bucket veya uygun şekilde ayrılmış tek bir obje depolama yapısı hazırlanır:

- admin build
- medya dosyaları

### Adım 3

Toplam üç `CloudFront` dağıtımı veya eşdeğer üç yayın katmanı hazırlanır:

- web ve API için EC2/Nginx origin'i önünde
- admin panel için S3 origin'i önünde
- medya dosyaları için S3 origin'i önünde

İstenirse bunlara özel domain bağlanır:

- `example.com` ve `api.example.com`
- `admin.example.com`
- `media.example.com`

### Adım 4

EC2 sunucusu hazırlanır:

- Docker
- Git
- Compose

### Adım 5

Repo EC2 içine alınır ve production env dosyaları hazırlanır.

### Adım 6

`docker-compose.prod.yml` ile şu servisler ayağa kaldırılır:

- `web`
- `api`
- `nginx`

### Adım 7

Admin panel build alınır ve PowerShell deploy script'i ile `S3 + CloudFront` tarafına yüklenir.

### Adım 8

Backend upload akışı test edilir:

- dosya backend'e gelir
- backend dosyayı `S3`'e yazar
- backend public URL döndürür
- public URL `CloudFront` tabanlı medya alanını gösterir

## 8. Bugün Zaten Desteklenenler ve Hâlâ Altyapı Tarafında Kalanlar

### Repo tarafında zaten desteklenenler

- `web + api + nginx` için production compose yapısı
- web ve API için CloudFront arkasında çalışabilecek host bazlı origin yapısı
- backend tarafında `S3` medya yükleme desteği
- medya için custom public base URL kullanımı
- admin panel için `S3` deploy script'i
- admin panel için `CloudFront invalidation` desteği
- web tarafında ayrı `API` ve `MEDIA` base URL yapısı

### Hâlâ AWS tarafında senin kurman gerekenler

- gerçek `RDS` instance
- `S3` bucket'ların oluşturulması
- `CloudFront` distribution'ların oluşturulması
- gerekiyorsa `Route 53` kayıtları
- gerekiyorsa `ACM` sertifikaları
- production güvenlik grupları

### Opsiyonel veya ileri seviye başlıklar

- `CloudWatch` log toplama
- `ALB`
- `ECS / EKS`
- `CI/CD`
- `Multi-AZ`
- `Auto Scaling`

## 9. Güvenlik Notları

Bu mimaride dikkat edilmesi gereken temel güvenlik kuralları:

- `RDS` public erişime açılmamalıdır
- `3000` ve `8000` portları doğrudan internete açılmamalıdır
- dış dünyaya mümkünse yalnızca `Nginx` açılmalıdır
- production'da AWS access key yerine mümkünse `IAM Role` kullanılmalıdır
- admin ve medya bucket erişimi doğrudan herkese açık yapmak yerine `CloudFront` odaklı kontrol modeli tercih edilmelidir

## 10. Kısa Sonuç

Bu repo için güncel AWS production yaklaşımı şu şekildedir:

- `EC2`
  Next.js web + FastAPI API + Nginx
- `RDS PostgreSQL`
  veritabanı
- `S3`
  admin panel build çıktıları ve medya dosyaları
- `CloudFront`
  web, API, admin panel ve medya dağıtımı
- `IAM Role + Security Groups`
  erişim ve güvenlik yönetimi

En önemli düzeltme şudur:

- `CloudFront`, bu dokümanda artık “sonradan eklenebilir opsiyonel fikir” olarak değil
- web, API, admin panel ve medya katmanlarının mevcut production tasarımındaki doğal parçası olarak ele alınmalıdır

Kısacası, bugünkü repo yapısı için doğru okuma:

- web ve api -> `CloudFront -> EC2`
- admin -> `S3 + CloudFront`
- media -> `S3 + CloudFront`
- db -> `RDS`

## 11. Resmi AWS Kaynakları

- EC2: https://aws.amazon.com/ec2/
- RDS PostgreSQL: https://aws.amazon.com/rds/postgresql/
- S3: https://aws.amazon.com/s3/
- CloudFront: https://aws.amazon.com/cloudfront/
- IAM: https://aws.amazon.com/iam/
- CloudWatch: https://aws.amazon.com/cloudwatch/
