import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { d1Query, d1First, d1Run } from "@/lib/d1";

interface PopupArchive {
  id: string;
  name: string;
  description: string;
  category: "event" | "notice" | "promotion";
  status: "active" | "ended" | "scheduled";
  startDate: string;
  endDate: string | null;
  thumbnailUrl: string;
  order: number;
  isActive: boolean;
}

type Row = Record<string, unknown>;

function rowToPopup(r: Row): PopupArchive {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    description: String(r.description || ""),
    category: String(r.category || "event") as PopupArchive["category"],
    status: String(r.status || "active") as PopupArchive["status"],
    startDate: String(r.startDate || ""),
    endDate: r.endDate ? String(r.endDate) : null,
    thumbnailUrl: String(r.thumbnailUrl || ""),
    order: Number(r.order) || 0,
    isActive: Number(r.isActive) === 1,
  };
}

const ALLOWED = [
  "name",
  "description",
  "category",
  "status",
  "startDate",
  "endDate",
  "thumbnailUrl",
  "order",
  "isActive",
];

// GET: 팝업 목록 (order asc)
export async function GET() {
  try {
    const rows = await d1Query<Row>(`SELECT * FROM popups ORDER BY "order" ASC`);
    return NextResponse.json(rows.map(rowToPopup));
  } catch (error) {
    console.error("GET popups error:", error);
    return NextResponse.json(
      { error: "팝업 데이터를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: 팝업 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || randomUUID();
    await d1Run(
      `INSERT INTO popups (id, name, description, category, status, startDate, endDate, thumbnailUrl, "order", isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name || "",
        body.description || "",
        body.category || "event",
        body.status || "active",
        body.startDate || "",
        body.endDate || "",
        body.thumbnailUrl || "",
        body.order || 0,
        body.isActive ? 1 : 0,
      ]
    );
    const row = await d1First<Row>(`SELECT * FROM popups WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, popup: row ? rowToPopup(row) : null });
  } catch (error) {
    console.error("POST popup error:", error);
    return NextResponse.json({ error: "팝업 추가 중 오류가 발생했습니다" }, { status: 500 });
  }
}

// PATCH: 팝업 수정
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "id가 필요합니다" }, { status: 400 });

    if (typeof fields.isActive === "boolean") fields.isActive = fields.isActive ? 1 : 0;
    const cols = Object.keys(fields).filter((k) => ALLOWED.includes(k));
    if (cols.length === 0)
      return NextResponse.json({ error: "수정할 필드가 없습니다" }, { status: 400 });

    const setClause = cols.map((c) => `"${c}" = ?`).join(", ");
    const params = cols.map((c) => fields[c] as string | number | null);
    await d1Run(`UPDATE popups SET ${setClause} WHERE id = ?`, [...params, id]);

    const row = await d1First<Row>(`SELECT * FROM popups WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, popup: row ? rowToPopup(row) : null });
  } catch (error) {
    console.error("PATCH popup error:", error);
    return NextResponse.json({ error: "팝업 수정 중 오류가 발생했습니다" }, { status: 500 });
  }
}

// DELETE: 팝업 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id가 필요합니다" }, { status: 400 });
    await d1Run(`DELETE FROM popups WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: "팝업이 삭제되었습니다" });
  } catch (error) {
    console.error("DELETE popup error:", error);
    return NextResponse.json({ error: "팝업 삭제 중 오류가 발생했습니다" }, { status: 500 });
  }
}
