import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_JOURNAL_TABLE_ID;

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

interface AirtableRecord {
  id: string;
  fields: {
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    thumbnail?: string;
    images?: string;
    createdAt?: string;
    viewCount?: number;
    order?: number;
    isPublished?: boolean;
  };
}

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

// Airtable 레코드를 Journal로 변환
function transformRecord(record: AirtableRecord): Journal {
  return {
    id: record.id,
    title: record.fields.title || "",
    excerpt: record.fields.excerpt || "",
    content: record.fields.content || "",
    category: (record.fields.category as Journal["category"]) || "event",
    thumbnail: record.fields.thumbnail || "",
    images: record.fields.images ? record.fields.images.split(",").map(s => s.trim()) : [],
    createdAt: record.fields.createdAt || "",
    viewCount: record.fields.viewCount || 0,
    order: record.fields.order || 0,
    isPublished: record.fields.isPublished ?? true,
  };
}

// GET: 저널 목록 조회
export async function GET(request: NextRequest) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    // 공개된 저널만 가져오기, 최신순 정렬
    const filterFormula = encodeURIComponent("{isPublished}=TRUE()");
    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${filterFormula}&sort[0][field]=createdAt&sort[0][direction]=desc`,
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
    const journals = data.records.map(transformRecord);

    return NextResponse.json(journals);
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
              title: body.title,
              excerpt: body.excerpt,
              content: body.content,
              category: body.category,
              thumbnail: body.thumbnail,
              images: Array.isArray(body.images) ? body.images.join(", ") : body.images,
              createdAt: body.createdAt || new Date().toISOString().split("T")[0],
              viewCount: body.viewCount || 0,
              order: body.order || 0,
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
    const journal = transformRecord(data.records[0]);

    return NextResponse.json({
      success: true,
      journal,
    });
  } catch (error) {
    console.error("POST journal error:", error);
    return NextResponse.json(
      { error: "저널 추가 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PATCH: 저널 수정 (조회수 증가 등)
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

    // images 배열을 문자열로 변환
    if (Array.isArray(fields.images)) {
      fields.images = fields.images.join(", ");
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
    const journal = transformRecord(data.records[0]);

    return NextResponse.json({
      success: true,
      journal,
    });
  } catch (error) {
    console.error("PATCH journal error:", error);
    return NextResponse.json(
      { error: "저널 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 저널 삭제
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
      message: "저널이 삭제되었습니다",
    });
  } catch (error) {
    console.error("DELETE journal error:", error);
    return NextResponse.json(
      { error: "저널 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
