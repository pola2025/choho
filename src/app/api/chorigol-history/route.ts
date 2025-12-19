import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_CHORIGOL_HISTORY_TABLE_ID;

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

interface AirtableRecord {
  id: string;
  fields: {
    year?: string;
    title?: string;
    content?: string;
    source?: string;
    sourceUrl?: string;
    category?: string;
    order?: number;
    viewCount?: number;
    isPublished?: boolean;
  };
}

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

// Airtable 레코드를 ChorigolHistory로 변환
function transformRecord(record: AirtableRecord): ChorigolHistory {
  return {
    id: record.id,
    year: record.fields.year || "",
    title: record.fields.title || "",
    content: record.fields.content || "",
    source: record.fields.source || "",
    sourceUrl: record.fields.sourceUrl || "",
    category: (record.fields.category as ChorigolHistory["category"]) || "history",
    order: record.fields.order || 0,
    viewCount: record.fields.viewCount || 0,
    isPublished: record.fields.isPublished ?? true,
  };
}

// GET: 초리골 역사 목록 조회
export async function GET(request: NextRequest) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    // 공개된 기사만 가져오기, year 기준 오름차순 정렬
    const filterFormula = encodeURIComponent("{isPublished}=TRUE()");
    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${filterFormula}&sort[0][field]=order&sort[0][direction]=asc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    const histories = data.records.map(transformRecord);

    return NextResponse.json(histories);
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
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              year: body.year,
              title: body.title,
              content: body.content,
              source: body.source,
              sourceUrl: body.sourceUrl,
              category: body.category,
              order: body.order || 0,
              viewCount: body.viewCount || 0,
              isPublished: body.isPublished ?? true,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Airtable API error");
    }

    const data = await response.json();
    const history = transformRecord(data.records[0]);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("POST chorigol-history error:", error);
    return NextResponse.json(
      { error: "초리골 역사 추가 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PATCH: 초리골 역사 수정
export async function PATCH(request: NextRequest) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id가 필요합니다" },
        { status: 400 }
      );
    }

    const response = await fetch(AIRTABLE_URL, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            id,
            fields,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Airtable API error");
    }

    const data = await response.json();
    const history = transformRecord(data.records[0]);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("PATCH chorigol-history error:", error);
    return NextResponse.json(
      { error: "초리골 역사 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 초리골 역사 삭제
export async function DELETE(request: NextRequest) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id가 필요합니다" },
        { status: 400 }
      );
    }

    const response = await fetch(`${AIRTABLE_URL}?records[]=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Airtable API error");
    }

    return NextResponse.json({
      success: true,
      message: "초리골 역사가 삭제되었습니다",
    });
  } catch (error) {
    console.error("DELETE chorigol-history error:", error);
    return NextResponse.json(
      { error: "초리골 역사 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
