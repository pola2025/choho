import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      );
    }

    // 파일 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)" },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기가 10MB를 초과합니다" },
        { status: 400 }
      );
    }

    // 파일 이름 생성 (타임스탬프 + 원본 이름)
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const extension = path.extname(originalName) || ".jpg";
    const baseName = path.basename(originalName, extension);
    const fileName = `${baseName}_${timestamp}${extension}`;

    // 저장 경로 설정
    const uploadDir = path.join(process.cwd(), "public", "images", category);

    // 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 파일 저장
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 웹에서 접근 가능한 경로 반환
    const publicPath = `/images/${category}/${fileName}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 업로드된 이미지 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "general";

    const uploadDir = path.join(process.cwd(), "public", "images", category);

    if (!existsSync(uploadDir)) {
      return NextResponse.json({ images: [] });
    }

    const fs = await import("fs/promises");
    const files = await fs.readdir(uploadDir);

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        path: `/images/${category}/${file}`,
      }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      { error: "이미지 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
