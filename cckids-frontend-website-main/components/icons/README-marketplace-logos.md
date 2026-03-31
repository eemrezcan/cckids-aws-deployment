# E-Ticaret Platform Logolari - Kucuk Boyutlar Icin Optimize Edilmis

## Sorun ve Cozum

Sorun: SVG logolari `h-5 w-5` (20px) gibi kucuk boyutlarda ince/okunmasi zor gorunebiliyordu.

Cozum:
- ViewBox 20x20 olacak sekilde optimize edildi.
- Stroke kalinliklari artirildi.
- Icerik sadeleştirildi ve kucuk boyutta okunabilirlik artirildi.
- Varsayilan `size` degeri 20 yapildi.

## Dosyalar

- `marketplace-logos.tsx`: Optimize edilmis ana ikon dosyasi (aktif kullanim).
- `marketplace-logos-optimized.tsx`: Geriye uyumluluk alias'i (README ornekleriyle uyumlu).

## Kullanim

```tsx
import { Amazon, Trendyol, Hepsiburada } from "@/components/icons/marketplace-logos-optimized";

export function Example() {
  return (
    <div className="flex gap-2">
      <Amazon className="h-5 w-5" />
      <Trendyol className="h-5 w-5" />
      <Hepsiburada className="h-5 w-5" />
    </div>
  );
}
```

## Onerilen Boyutlar

- `h-4 w-4` (16px): Iyi
- `h-5 w-5` (20px): En iyi denge
- `h-6 w-6` (24px): Cok net
- `h-8 w-8` (32px): Cok net

## Notlar

- `h-3 w-3` ve altina inmek onerilmez.
- `transform: scale()` yerine dogrudan boyut class'i kullanin.
- Footer gibi dairesel kapsayicilarda ikonlari `h-5 w-5` merkezli kullanin.

