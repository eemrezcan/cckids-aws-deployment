// components/ProjectCard.tsx
import Link from "next/link";
import type { ProjectListItemPublicOut } from "@/lib/api/types";
import { buildMediaUrl } from "@/lib/utils/url";
import { getServerLang, getServerT } from "@/lib/i18n/server";

function formatMonthYearTR(input?: string | null) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(d);
}

export default async function ProjectCard({ project }: { project: ProjectListItemPublicOut }) {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const dateLabel = formatMonthYearTR(project.completed_at);
  const categoryName = project.category?.name ?? null;

  const img = buildMediaUrl(project.featured_image_url ?? null) ?? "";

  return (
    <Link
      href={`/projects/${encodeURIComponent(project.uuid)}`}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cc-pink/15 via-cc-purple/15 to-cc-cyan/15" />
        )}

        <div className="absolute top-4 left-4 flex gap-2">
          {categoryName ? (
            <span className="bg-cc-pink text-white px-3 py-1 rounded-full text-xs font-bold">
              {categoryName}
            </span>
          ) : null}
        </div>

        {project.location ? (
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-cc-text px-3 py-1 rounded-full text-xs font-bold">
              📍 {project.location}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        {dateLabel ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <span>📅</span>
            <span>{dateLabel}</span>
          </div>
        ) : null}

        <h3 className="font-display text-xl font-bold text-cc-text mb-2 group-hover:text-cc-pink transition-colors">
          {project.name}
        </h3>

        {project.short_info ? (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.short_info}</p>
        ) : (
          <p className="text-gray-400 text-sm mb-4">{t("common.detailsForReview", "Detaylar için inceleyin.")}</p>
        )}

        <span className="inline-flex items-center gap-2 text-cc-pink font-bold text-sm group-hover:gap-3 transition-all duration-300">
          {t("common.viewDetail", "Detayı Gör")}
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
