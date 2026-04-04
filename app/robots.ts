import type { MetadataRoute } from "next";
import config from "@/school.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `https://${config.school.domain}/sitemap.xml`,
  };
}
