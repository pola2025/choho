import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { d1Query, d1First, d1Run } from "@/lib/d1";

export interface ChorigolHistory {
  id: string;
  year: string;
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: "origin" | "history" | "nature" | "culture" | "development";
  order: number;
  viewCount: number;
  isPublished: boolean;
}

// 카테고리 한글 매핑
export const categoryLabels: Record<string, string> = {
  origin: "지명유래",
  history: "근현대사",
  nature: "자연환경",
  culture: "문화유산",
  development: "마을발전",
};

type Row = Record<string, unknown>;

function rowToHistory(r: Row): ChorigolHistory {
  return {
    id: String(r.id),
    year: String(r.year || ""),
    title: String(r.title || ""),
    content: String(r.content || ""),
    source: String(r.source || ""),
    sourceUrl: String(r.sourceUrl || ""),
    category: String(r.category || "history") as ChorigolHistory["category"],
    order: Number(r.order) || 0,
    viewCount: Number(r.viewCount) || 0,
    isPublished: Number(r.isPublished) === 1,
  };
}

const ALLOWED = [
  "year",
  "title",
  "content",
  "source",
  "sourceUrl",
  "category",
  "order",
  "viewCount",
  "isPublished",
];

// GET: 초리골 역사 목록 (공개, order asc)
export async function GET() {
  try {
    const rows = await d1Query<Row>(
      `SELECT * FROM chorigol_histories WHERE isPublished = 1 ORDER BY "order" ASC`
    );
    return NextResponse.json(rows.map(rowToHistory));
  } catch (error) {
    console.error("GET chorigol-history error:", error);
    return NextResponse.json(
      { error: "초리골 역사 데이터를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: 초리골 역사 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || randomUUID();
    await d1Run(
      `INSERT INTO chorigol_histories (id, year, title, content, source, sourceUrl, category, "order", viewCount, isPublished)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.year || "",
        body.title || "",
        body.content || "",
        body.source || "",
        body.sourceUrl || "",
        body.category || "history",
        body.order || 0,
        body.viewCount || 0,
        body.isPublished === false ? 0 : 1,
      ]
    );
    const row = await d1First<Row>(`SELECT * FROM chorigol_histories WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, history: row ? rowToHistory(row) : null });
  } catch (error) {
    console.error("POST chorigol-history error:", error);
    return NextResponse.json({ error: "초리골 역사 추가 중 오류가 발생했습니다" }, { status: 500 });
  }
}

// PATCH: 초리골 역사 수정 (조회수 등)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "id가 필요합니다" }, { status: 400 });

    if (typeof fields.isPublished === "boolean") fields.isPublished = fields.isPublished ? 1 : 0;
    const cols = Object.keys(fields).filter((k) => ALLOWED.includes(k));
    if (cols.length === 0)
      return NextResponse.json({ error: "수정할 필드가 없습니다" }, { status: 400 });

    const setClause = cols.map((c) => `"${c}" = ?`).join(", ");
    const params = cols.map((c) => fields[c] as string | number | null);
    await d1Run(`UPDATE chorigol_histories SET ${setClause} WHERE id = ?`, [...params, id]);

    const row = await d1First<Row>(`SELECT * FROM chorigol_histories WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, history: row ? rowToHistory(row) : null });
  } catch (error) {
    console.error("PATCH chorigol-history error:", error);
    return NextResponse.json({ error: "초리골 역사 수정 중 오류가 발생했습니다" }, { status: 500 });
  }
}

// DELETE: 초리골 역사 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id가 필요합니다" }, { status: 400 });
    await d1Run(`DELETE FROM chorigol_histories WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: "초리골 역사가 삭제되었습니다" });
  } catch (error) {
    console.error("DELETE chorigol-history error:", error);
    return NextResponse.json({ error: "초리골 역사 삭제 중 오류가 발생했습니다" }, { status: 500 });
  }
}
