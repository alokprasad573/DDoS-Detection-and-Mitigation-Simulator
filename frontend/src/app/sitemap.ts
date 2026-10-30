import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const rawUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_BACKEND_APP_URL || "https://sentrix-bay.vercel.app/";
  const baseUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`;
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/overview`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];
}

