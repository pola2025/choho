import { NextRequest, NextResponse } from "next/server";
import { d1First, d1Run } from "@/lib/d1";

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

type Row = Record<string, unknown>;

function rowToJournal(r: Row): Journal {
  return {
    id: String(r.id),
    title: String(r.title || ""),
    excerpt: String(r.excerpt || ""),
    content: String(r.content || ""),
    category: String(r.category || "event") as Journal["category"],
    thumbnail: String(r.thumbnail || ""),
    images: r.images
      ? String(r.images)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    createdAt: String(r.createdAt || ""),
    viewCount: Number(r.viewCount) || 0,
    order: Number(r.order) || 0,
    isPublished: Number(r.isPublished) === 1,
  };
}

// GET: 개별 저널 조회 + 조회수 증가
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const row = await d1First<Row>(`SELECT * FROM journals WHERE id = ?`, [id]);
    if (!row) {
      return NextResponse.json({ error: "저널을 찾을 수 없습니다" }, { status: 404 });
    }
    const journal = rowToJournal(row);
    if (!journal.isPublished) {
      return NextResponse.json({ error: "저널을 찾을 수 없습니다" }, { status: 404 });
    }

    // 조회수 증가 (백그라운드)
    d1Run(`UPDATE journals SET viewCount = viewCount + 1 WHERE id = ?`, [id]).catch(console.error);

    return NextResponse.json(journal);
  } catch (error) {
    console.error("GET journal error:", error);
    return NextResponse.json({ error: "저널을 가져오는 중 오류가 발생했습니다" }, { status: 500 });
  }
}
