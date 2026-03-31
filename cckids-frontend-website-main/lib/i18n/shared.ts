import tr from "./locales/tr.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGS = ["tr", "en"] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = "tr";
export const LANG_COOKIE_KEY = "lang";

const dictionaries = { tr, en } as const;

type Dictionary = (typeof dictionaries)[Lang];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function normalizeLang(value: unknown): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

function resolveKey(dict: Dictionary, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = dict;

  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function translate(lang: Lang, key: string, fallback?: string): string {
  const normalized = normalizeLang(lang);
  return resolveKey(dictionaries[normalized], key) ?? resolveKey(dictionaries[DEFAULT_LANG], key) ?? fallback ?? key;
}
