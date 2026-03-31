import { cookies } from "next/headers";
import { LANG_COOKIE_KEY, Lang, normalizeLang, translate } from "./shared";

export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  return normalizeLang(store.get(LANG_COOKIE_KEY)?.value);
}

export function getServerT(lang: Lang) {
  return (key: string, fallback?: string) => translate(lang, key, fallback);
}
