import { MetadataRoute } from "next";
import { rooms, journals } from "@/lib/data";

const BASE_URL = "https://www.chorigol.co.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/rooms`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cafe`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/location`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  // 객실 상세 페이지
  const roomPages: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: `${BASE_URL}/rooms/${room.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // 저널 상세 페이지
  const journalPages: MetadataRoute.Sitemap = journals.map((journal) => ({
    url: `${BASE_URL}/about/journal/${journal.id}`,
    lastModified: new Date(journal.createdAt),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...roomPages, ...journalPages];
}
