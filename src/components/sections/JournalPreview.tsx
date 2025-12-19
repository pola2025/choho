"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Journal {
  id: string;
  title: string;
  excerpt: string;
  category: "event" | "notice" | "guide";
  thumbnail: string;
  createdAt: string;
  viewCount: number;
}

const categoryLabels: Record<string, { label: string; color: string; gradient: string }> = {
  notice: {
    label: "공지",
    color: "bg-blue-100 text-blue-700",
    gradient: "from-blue-500 to-blue-600",
  },
  guide: {
    label: "가이드",
    color: "bg-green-100 text-green-700",
    gradient: "from-green-500 to-green-600",
  },
  event: {
    label: "이벤트",
    color: "bg-amber-100 text-amber-700",
    gradient: "from-amber-500 to-amber-600",
  },
};

export function JournalPreview() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJournals() {
      try {
        const response = await fetch("/api/journals");
        if (response.ok) {
          const data = await response.json();
          setJournals(data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch journals:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJournals();
  }, []);

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-section" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft border border-border text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Journal</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
              초호 저널
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              초호의 소식과 주변 가이드
            </p>
          </div>

          {/* More Link - Desktop */}
          <Link
            href="/about/journal"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-soft border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group"
          >
            <span>전체 보기</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Journal Grid */}
        {!isLoading && journals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {journals.map((journal, index) => {
              const categoryInfo = categoryLabels[journal.category] || categoryLabels.event;
              return (
                <Link
                  key={journal.id}
                  href={`/about/journal/${journal.id}`}
                  className="group"
                >
                  <article
                    className="card-premium overflow-hidden h-full flex flex-col"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Thumbnail */}
                    {journal.thumbnail && (
                      <div className="relative aspect-[5/7] overflow-hidden">
                        <img
                          src={journal.thumbnail}
                          alt={journal.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-5 sm:p-6 flex-grow flex flex-col">
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full",
                            categoryInfo.color
                          )}
                        >
                          {categoryInfo.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-neutral-900 mb-3 line-clamp-2 text-base sm:text-lg group-hover:text-primary transition-colors">
                        {journal.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow leading-relaxed">
                        {journal.excerpt}
                      </p>

                      {/* Date & Views */}
                      <div className="flex items-center justify-between text-xs text-neutral-400 pt-4 border-t border-border mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{journal.createdAt}</span>
                        </div>
                        {journal.viewCount > 0 && (
                          <span>조회 {journal.viewCount}</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && journals.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 등록된 저널이 없습니다.</p>
          </div>
        )}

        {/* Mobile More Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/about/journal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-soft border border-border text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <span>전체 보기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
