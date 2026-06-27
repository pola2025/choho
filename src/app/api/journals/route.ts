import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { d1Query, d1First, d1Run } from "@/lib/d1";

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

// GET: 공개 저널 목록 (최신순)
export async function GET() {
  try {
    const rows = await d1Query<Row>(
      `SELECT * FROM journals WHERE isPublished = 1 ORDER BY createdAt DESC`
    );
    return NextResponse.json(rows.map(rowToJournal));
  } catch (error) {
    console.error("GET journals error:", error);
    return NextResponse.json(
      { error: "저널 데이터를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: 저널 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || randomUUID();
    const images = Array.isArray(body.images) ? body.images.join(", ") : body.images || "";
    await d1Run(
      `INSERT INTO journals (id, title, excerpt, content, category, thumbnail, images, createdAt, viewCount, "order", isPublished)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.title || "",
        body.excerpt || "",
        body.content || "",
        body.category || "event",
        body.thumbnail || "",
        images,
        body.createdAt || new Date().toISOString().split("T")[0],
        body.viewCount || 0,
        body.order || 0,
        body.isPublished === false ? 0 : 1,
      ]
    );
    const row = await d1First<Row>(`SELECT * FROM journals WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, journal: row ? rowToJournal(row) : null });
  } catch (error) {
    console.error("POST journal error:", error);
    return NextResponse.json({ error: "저널 추가 중 오류가 발생했습니다" }, { status: 500 });
  }
}

// PATCH: 저널 수정 (조회수 증가 등)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "id가 필요합니다" }, { status: 400 });

    if (Array.isArray(fields.images)) fields.images = fields.images.join(", ");
    if (typeof fields.isPublished === "boolean") fields.isPublished = fields.isPublished ? 1 : 0;

    const allowed = [
      "title",
      "excerpt",
      "content",
      "category",
      "thumbnail",
      "images",
      "createdAt",
      "viewCount",
      "order",
      "isPublished",
    ];
    const cols = Object.keys(fields).filter((k) => allowed.includes(k));
    if (cols.length === 0)
      return NextResponse.json({ error: "수정할 필드가 없습니다" }, { status: 400 });

    const setClause = cols.map((c) => `"${c}" = ?`).join(", ");
    const params = cols.map((c) => fields[c] as string | number | null);
    await d1Run(`UPDATE journals SET ${setClause} WHERE id = ?`, [...params, id]);

    const row = await d1First<Row>(`SELECT * FROM journals WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, journal: row ? rowToJournal(row) : null });
  } catch (error) {
    console.error("PATCH journal error:", error);
    return NextResponse.json({ error: "저널 수정 중 오류가 발생했습니다" }, { status: 500 });
  }
}

// DELETE: 저널 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id가 필요합니다" }, { status: 400 });
    await d1Run(`DELETE FROM journals WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: "저널이 삭제되었습니다" });
  } catch (error) {
    console.error("DELETE journal error:", error);
    return NextResponse.json({ error: "저널 삭제 중 오류가 발생했습니다" }, { status: 500 });
  }
}
