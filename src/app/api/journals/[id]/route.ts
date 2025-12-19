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

// GET: 개별 저널 조회 + 조회수 증가
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Airtable 설정이 필요합니다" },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;

    // 저널 조회
    const response = await fetch(`${AIRTABLE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "저널을 찾을 수 없습니다" },
          { status: 404 }
        );
      }
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const record = await response.json();
    const journal = transformRecord(record);

    // 비공개 저널은 접근 불가
    if (!journal.isPublished) {
      return NextResponse.json(
        { error: "저널을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 조회수 증가 (백그라운드)
    fetch(AIRTABLE_URL, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            id,
            fields: {
              viewCount: (journal.viewCount || 0) + 1,
            },
          },
        ],
      }),
    }).catch(console.error);

    return NextResponse.json(journal);
  } catch (error) {
    console.error("GET journal error:", error);
    return NextResponse.json(
      { error: "저널을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
