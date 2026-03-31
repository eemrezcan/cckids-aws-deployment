import type { MetadataRoute } from "next";
import { getCategories, getProducts, getProjects } from "@/lib/api/endpoints";
import { canonicalUrl } from "@/lib/seo";

export const revalidate = 300;

const STATIC_PATHS = ["/", "/about", "/contact", "/products", "/projects", "/references"];

async function getAllProductUuids() {
  const pageSize = 100;
  const first = await getProducts({ page: 1, page_size: pageSize, lang: "tr" });
  const items = [...(first.items ?? [])];
  const total = typeof first.total === "number" ? first.total : items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await getProducts({ page, page_size: pageSize, lang: "tr" });
    items.push(...(next.items ?? []));
  }

  return items.map((item) => item.uuid).filter(Boolean);
}

async function getAllProjectUuids() {
  const pageSize = 100;
  const first = await getProjects(1, pageSize, undefined, undefined, "tr");
  const items = [...(first.items ?? [])];
  const total = typeof first.total === "number" ? first.total : items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await getProjects(page, pageSize, undefined, undefined, "tr");
    items.push(...(next.items ?? []));
  }

  return items.map((item) => item.uuid).filter(Boolean);
}

async function getAllCategoryUuids() {
  const pageSize = 100;
  const first = await getCategories({ page: 1, page_size: pageSize, lang: "tr" });
  const items = [...(first.items ?? [])];
  const total = typeof first.total === "number" ? first.total : items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await getCategories({ page, page_size: pageSize, lang: "tr" });
    items.push(...(next.items ?? []));
  }

  return items.map((item) => item.uuid).filter(Boolean);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [productUuids, projectUuids, categoryUuids] = await Promise.all([
    getAllProductUuids(),
    getAllProjectUuids(),
    getAllCategoryUuids(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: canonicalUrl(path),
    lastModified: now,
  }));

  const productEntries: MetadataRoute.Sitemap = productUuids.map((uuid) => ({
    url: canonicalUrl(`/products/${encodeURIComponent(uuid)}`),
    lastModified: now,
  }));

  const projectEntries: MetadataRoute.Sitemap = projectUuids.map((uuid) => ({
    url: canonicalUrl(`/projects/${encodeURIComponent(uuid)}`),
    lastModified: now,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categoryUuids.map((uuid) => ({
    url: canonicalUrl(`/products/categories/${encodeURIComponent(uuid)}`),
    lastModified: now,
  }));

  return [...staticEntries, ...productEntries, ...projectEntries, ...categoryEntries];
}
