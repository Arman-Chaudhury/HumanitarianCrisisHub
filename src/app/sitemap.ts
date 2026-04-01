import type { MetadataRoute } from "next";
import { getAllCrisisSlugs } from "@/lib/crises";

const BASE_URL = "https://crisishub.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllCrisisSlugs();

  const crisisPages = slugs.map((slug) => ({
    url: `${BASE_URL}/crises/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/take-action`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...crisisPages,
  ];
}
