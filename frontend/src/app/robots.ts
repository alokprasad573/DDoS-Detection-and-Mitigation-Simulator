import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_BACKEND_APP_URL || "https://sentrix-bay.vercel.app/";
    
  const baseUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/overview"],
        disallow: [
          "/detection",
          "/models",
          "/protection",
          "/simulator",
          "/health",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
