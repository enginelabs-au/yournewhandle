import type { MetadataRoute } from "next";

import { SITE_LEGAL_PATHS, SITE_URL } from "@/lib/site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/developers", priority: 0.9, changeFrequency: "weekly" as const },
    { path: SITE_LEGAL_PATHS.support, priority: 0.7, changeFrequency: "monthly" as const },
    { path: SITE_LEGAL_PATHS.terms, priority: 0.5, changeFrequency: "yearly" as const },
    { path: SITE_LEGAL_PATHS.privacy, priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
