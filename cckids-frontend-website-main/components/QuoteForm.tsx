// components/QuoteForm.tsx
"use client";

import QuoteRequestForm from "@/components/QuoteRequestForm";

type QuoteFormProps = {
  productId?: number | null;
  productName?: string | null;
  productUuid?: string | null;

  // Ürün seçimleri (opsiyonel)
  selectedColorName?: string | null;
  selectedSizeLabel?: string | null;
  productImageUrl?: string | null;
};

/**
 * QuoteForm: Geriye dönük uyumluluk için wrapper.
 * - Asıl form QuoteRequestForm içinde.
 */
export default function QuoteForm({
  productId = null,
  productName = null,
  productUuid = null,
  selectedColorName = null,
  selectedSizeLabel = null,
  productImageUrl = null,
}: QuoteFormProps) {
  return (
    <QuoteRequestForm
      variant="product"
      productId={productId}
      productUuid={productUuid}
      productName={productName}
      selectedColorName={selectedColorName}
      selectedSizeLabel={selectedSizeLabel}
      productImageUrl={productImageUrl}
    />
  );
}
