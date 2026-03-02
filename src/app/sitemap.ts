import { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://faucet-stellar.acachete.xyz";
  const currentDate = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push(
      {
        url: `${baseUrl}/${locale}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${baseUrl}/${locale}/trustlines`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    );
  }

  return entries;
}
