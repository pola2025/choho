import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { journals } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

const categoryLabels = {
  notice: { label: "공지", color: "bg-blue-100 text-blue-700" },
  guide: { label: "가이드", color: "bg-green-100 text-green-700" },
  event: { label: "이벤트", color: "bg-amber-100 text-amber-700" },
};

export async function generateStaticParams() {
  return journals.map((journal) => ({ id: journal.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const journal = journals.find((j) => j.id === id);

  if (!journal) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: `${journal.title} | 초호펜션`,
    description: journal.excerpt,
  };
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const journal = journals.find((j) => j.id === id);

  if (!journal) {
    notFound();
  }

  const categoryInfo = categoryLabels[journal.category];

  return (
    <article className="pt-20 pb-16">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              홈
            </Link>
            <ChevronRight size={14} />
            <Link
              href="/about/journal"
              className="hover:text-primary transition-colors"
            >
              초호 저널
            </Link>
          </nav>

          {/* Category Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full mb-6 ${categoryInfo.color}`}
          >
            {categoryInfo.label}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            {journal.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            {journal.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={18} className="text-neutral-400" />
            {formatDate(journal.createdAt)}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Content Text */}
          <div className="prose prose-lg max-w-none mb-10">
            {journal.content.split("\n").map((paragraph, index) => (
              <p key={index} className="text-neutral-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Images - 원본 비율 유지 */}
          {journal.images && journal.images.length > 0 && (
            <div className="space-y-6 mb-10">
              {journal.images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden border border-border"
                >
                  <img
                    src={image}
                    alt={`${journal.title} ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Back to List */}
          <div className="pt-8 border-t border-border">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
