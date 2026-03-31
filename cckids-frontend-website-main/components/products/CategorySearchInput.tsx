// components/products/CategorySearchInput.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CategorySearchInput({
  placeholder,
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const initial = useMemo(() => sp.get("q") ?? "", [sp]);
  const [value, setValue] = useState(initial);

  // URL değişirse (back/forward), input güncellensin
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  // debounce ile URL güncelle
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());

      const v = value.trim();
      // aramada sayfayı 1'e çek
      params.set("page", "1");

      if (!v) params.delete("q");
      else params.set("q", v);

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full md:w-96">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
        🔎
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Bu kategoride ara..."}
        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-full shadow-sm outline-none focus:ring-4 focus:ring-cc-pink/20 focus:border-cc-pink transition-all text-gray-600 placeholder-gray-400"
      />
    </div>
  );
}
