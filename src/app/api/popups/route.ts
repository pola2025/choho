import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_POPUP_TABLE_ID;

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    name?: string;
    description?: string;
    category?: string;
    Status?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    thumbnailUrl?: string;
    order?: number;
    isActive?: boolean;
  };
}

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

// Airtable 레코드를 PopupArchive로 변환
// 에어테이블 필드명: Name, Status (대문자)
function transformRecord(record: AirtableRecord): PopupArchive {
  return {
    id: record.id,
    name: record.fields.Name || record.fields.name || "",
    description: record.fields.description || "",
    category: (record.fields.category as PopupArchive["category"]) || "event",
    status: (record.fields.Status || record.fields.status) as PopupArchive["status"] || "active",
    startDate: record.fields.startDate || "",
    endDate: record.fields.endDate || null,
    thumbnailUrl: record.fields.thumbnailUrl || "",
    order: record.fields.order || 0,
    isActive: record.fields.isActive || false,
  };
}

// GET: 팝업 목록 조회
export async function GET() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${AIRTABLE_URL}?sort[0][field]=order&sort[0][direction]=asc`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    const popups = data.records.map(transformRecord);

    return NextResponse.json(popups);
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
              name: body.name,
              description: body.description,
              category: body.category,
              status: body.status,
              startDate: body.startDate,
              endDate: body.endDate || null,
              thumbnailUrl: body.thumbnailUrl,
              order: body.order || 0,
              isActive: body.isActive || false,
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
    const popup = transformRecord(data.records[0]);

    return NextResponse.json({
      success: true,
      popup,
    });
  } catch (error) {
    console.error("POST popup error:", error);
    return NextResponse.json(
      { error: "팝업 추가 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PATCH: 팝업 수정
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
    const popup = transformRecord(data.records[0]);

    return NextResponse.json({
      success: true,
      popup,
    });
  } catch (error) {
    console.error("PATCH popup error:", error);
    return NextResponse.json(
      { error: "팝업 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 팝업 삭제
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
      message: "팝업이 삭제되었습니다",
    });
  } catch (error) {
    console.error("DELETE popup error:", error);
    return NextResponse.json(
      { error: "팝업 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
