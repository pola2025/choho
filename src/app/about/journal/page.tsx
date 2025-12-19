import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, BookOpen } from "lucide-react";

interface Journal {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "event" | "notice" | "guide";
  thumbnail: string;
  images: string[];
  createdAt: string;
  viewCount: number;
  order: number;
  isPublished: boolean;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  notice: { label: "공지", color: "bg-blue-100 text-blue-700" },
  guide: { label: "가이드", color: "bg-green-100 text-green-700" },
  event: { label: "이벤트", color: "bg-amber-100 text-amber-700" },
};

export const metadata = {
  title: "초호 저널 | 초호펜션",
  description: "초호펜션의 새로운 소식과 이벤트를 확인하세요.",
};

async function getJournals(): Promise<Journal[]> {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_ID = process.env.AIRTABLE_JOURNAL_TABLE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return [];
  }

  try {
    const filterFormula = encodeURIComponent("{isPublished}=TRUE()");
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${filterFormula}&sort[0][field]=createdAt&sort[0][direction]=desc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
      id: record.id,
      title: record.fields.title || "",
      excerpt: record.fields.excerpt || "",
      content: record.fields.content || "",
      category: record.fields.category || "event",
      thumbnail: record.fields.thumbnail || "",
      images: record.fields.images ? String(record.fields.images).split(",").map((s: string) => s.trim()) : [],
      createdAt: record.fields.createdAt || "",
      viewCount: record.fields.viewCount || 0,
      order: record.fields.order || 0,
      isPublished: record.fields.isPublished ?? true,
    }));
  } catch {
    return [];
  }
}

export default async function JournalListPage() {
  const journals = await getJournals();

  return (
    <div className="pt-20 pb-16">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              홈
            </Link>
            <ChevronRight size={14} />
            <span className="text-neutral-900 font-medium">초호 저널</span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
                초호 저널
              </h1>
              <p className="text-muted-foreground mt-1">
                초호펜션의 새로운 소식과 이벤트
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
          <span>전체 {journals.length}개</span>
          <span className="text-border">|</span>
          <span>이벤트 {journals.filter(j => j.category === 'event').length}개</span>
          <span className="text-border">|</span>
          <span>공지 {journals.filter(j => j.category === 'notice').length}개</span>
        </div>

        {/* Journal Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {journals.map((journal) => {
            const categoryInfo = categoryLabels[journal.category] || categoryLabels.event;
            return (
              <Link
                key={journal.id}
                href={`/about/journal/${journal.id}`}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[5/7] overflow-hidden bg-neutral-100">
                  <Image
                    src={journal.thumbnail || "/images/placeholder.webp"}
                    alt={journal.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${categoryInfo.color}`}
                    >
                      {categoryInfo.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {journal.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {journal.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(journal.createdAt)}
                    </div>
                    {journal.viewCount > 0 && (
                      <span>조회 {journal.viewCount}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {journals.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 등록된 저널이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
