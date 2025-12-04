import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { defaultSiteImages, type SiteImages } from "@/lib/site-images";

const DATA_FILE = path.join(process.cwd(), "data", "site-images.json");

// 이미지 데이터 로드
async function loadImageData(): Promise<SiteImages> {
  try {
    if (existsSync(DATA_FILE)) {
      const data = await readFile(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading image data:", error);
  }
  return defaultSiteImages;
}

// 이미지 데이터 저장
async function saveImageData(data: SiteImages): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET: 이미지 데이터 조회
export async function GET() {
  try {
    const images = await loadImageData();
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET images error:", error);
    return NextResponse.json(
      { error: "이미지 데이터를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PUT: 특정 이미지 URL 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, src } = body;

    if (!id || !src) {
      return NextResponse.json(
        { error: "id와 src가 필요합니다" },
        { status: 400 }
      );
    }

    const images = await loadImageData();

    // 이미지 찾아서 업데이트
    let updated = false;
    for (const category of Object.keys(images) as (keyof SiteImages)[]) {
      const idx = images[category].findIndex((img) => img.id === id);
      if (idx !== -1) {
        images[category][idx].src = src;
        updated = true;
        break;
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: "해당 ID의 이미지를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    await saveImageData(images);

    return NextResponse.json({
      success: true,
      message: "이미지가 업데이트되었습니다",
    });
  } catch (error) {
    console.error("PUT images error:", error);
    return NextResponse.json(
      { error: "이미지 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: 이미지 데이터 초기화
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "reset") {
      await saveImageData(defaultSiteImages);
      return NextResponse.json({
        success: true,
        message: "이미지 데이터가 초기화되었습니다",
      });
    }

    return NextResponse.json(
      { error: "알 수 없는 action입니다" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST images error:", error);
    return NextResponse.json(
      { error: "작업 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
