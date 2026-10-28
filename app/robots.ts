import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Room links only redirect to the lobby, and the API is not content.
      disallow: ["/api/", "/space/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
