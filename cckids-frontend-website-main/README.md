# CCKids – Next.js Sürümü

Bu proje, gönderdiğiniz Vite/React uygulamasının **Next.js (App Router)** versiyonudur.

## Kurulum

```bash
npm install
```

## Ortam Değişkeni

`.env.local` dosyası oluşturup aşağıdaki anahtarı girin:

```
GOOGLE_GENAI_API_KEY=...
```

(Örnek için: `.env.example`)

## Çalıştırma

```bash
npm run dev
```

Tarayıcı: http://localhost:3000

## Notlar
- Tailwind artık CDN yerine proje içine kurulu.
- Gemini API anahtarı istemciye gömülmez; istekler `app/api/gemini` üzerinden **server-side** yapılır.
