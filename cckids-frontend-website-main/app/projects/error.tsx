// app/projects/error.tsx
"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[2rem] shadow-xl p-8">
        <h1 className="font-display text-3xl font-bold text-cc-text mb-3">{t("common.error", "Bir hata oluştu")}</h1>
        <p className="text-gray-600 mb-6">
          {t("projectsPage.loadError", "Projeler yüklenirken sorun yaşandı. Lütfen tekrar deneyin.")}
        </p>

        <div className="text-sm text-gray-400 mb-6 break-words">
          {typeof error?.message === "string" ? error.message : t("common.unknownError", "Bilinmeyen hata")}
        </div>

        <button
          onClick={() => reset()}
          className="px-8 py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          {t("common.retry", "Tekrar dene")}
        </button>
      </div>
    </div>
  );
}
