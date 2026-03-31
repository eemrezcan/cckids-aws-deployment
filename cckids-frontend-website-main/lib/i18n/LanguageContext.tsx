"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LANG, LANG_COOKIE_KEY, Lang, normalizeLang, translate } from "./shared";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function setLangCookie(lang: Lang) {
  document.cookie = `${LANG_COOKIE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

function readLangCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((c) => c.trim());
  const found = parts.find((p) => p.startsWith(`${LANG_COOKIE_KEY}=`));
  if (!found) return null;
  return normalizeLang(found.split("=")[1] ?? null);
}

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang }) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(normalizeLang(initialLang ?? DEFAULT_LANG));

  useEffect(() => {
    const localLang = typeof window !== "undefined" ? window.localStorage.getItem(LANG_COOKIE_KEY) : null;
    const cookieLang = readLangCookie();
    const nextLang = normalizeLang(localLang ?? cookieLang ?? initialLang ?? DEFAULT_LANG);
    setLangState(nextLang);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_COOKIE_KEY, nextLang);
    }
    setLangCookie(nextLang);
    document.documentElement.lang = nextLang;
  }, [initialLang]);

  const setLang = (next: Lang) => {
    const normalized = normalizeLang(next);
    setLangState(normalized);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_COOKIE_KEY, normalized);
    }
    setLangCookie(normalized);
    document.documentElement.lang = normalized;
    router.refresh();
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, fallback) => translate(lang, key, fallback),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
