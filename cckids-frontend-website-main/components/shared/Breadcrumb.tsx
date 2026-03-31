// components/shared/Breadcrumb.tsx
import Link from 'next/link';

/**
 * Breadcrumb:
 * items: [{ label, href? }]
 * - href yoksa aktif/current olarak gösterilir.
 */
export type BreadcrumbItem = { label: string; href?: string | null };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm font-display">
      <ol className="flex flex-wrap items-center gap-2 text-cc-text/80">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${it.label}-${idx}`} className="flex items-center gap-2">
              {it.href && !isLast ? (
                <Link href={it.href} className="hover:text-cc-pink transition-colors">
                  {it.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-cc-text font-bold' : ''}>{it.label}</span>
              )}
              {!isLast && <span className="opacity-50">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
