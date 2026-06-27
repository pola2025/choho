import { MetadataRoute } from "next";
import { rooms } from "@/lib/data";
import { d1Query } from "@/lib/d1";

const BASE_URL = "https://www.chorigol.co.kr";

async function getJournalEntries(): Promise<{ id: string; createdAt: string }[]> {
  try {
    return await d1Query<{ id: string; createdAt: string }>(
      `SELECT id, createdAt FROM journals WHERE isPublished = 1 ORDER BY createdAt DESC`
    );
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // 저널 상세 페이지 (D1)
  const journals = await getJournalEntries();
  const journalPages: MetadataRoute.Sitemap = journals.map((journal) => ({
    url: `${BASE_URL}/about/journal/${journal.id}`,
    lastModified: journal.createdAt ? new Date(journal.createdAt) : now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...roomPages, ...journalPages];
}
