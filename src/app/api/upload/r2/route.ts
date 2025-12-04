import { NextRequest, NextResponse } from "next/server";
import { uploadToR2, isR2Configured } from "@/lib/r2";
import sharp from "sharp";

// WebP로 변환 및 압축
async function convertToWebP(
  buffer: Buffer,
  quality: number = 80,
  maxWidth: number = 1920
): Promise<Buffer> {
  let image = sharp(buffer);

  // 메타데이터 확인
  const metadata = await image.metadata();

  // 최대 너비 제한
  if (metadata.width && metadata.width > maxWidth) {
    image = image.resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  // WebP로 변환
  return image
    .webp({
      quality,
      effort: 4, // 압축 노력 (0-6, 높을수록 느리지만 더 작음)
    })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    // R2 설정 확인
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error: "R2가 설정되지 않았습니다. .env.local 파일을 확인하세요.",
          needsConfig: true,
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageId = formData.get("imageId") as string;
    const category = formData.get("category") as string || "general";
    const quality = parseInt(formData.get("quality") as string) || 80;
    const maxWidth = parseInt(formData.get("maxWidth") as string) || 1920;

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

    // 파일 크기 제한 (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기가 20MB를 초과합니다" },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // WebP로 압축
    const webpBuffer = await convertToWebP(originalBuffer, quality, maxWidth);

    // 파일명 생성
    const timestamp = Date.now();
    const cleanId = imageId ? imageId.replace(/[^a-zA-Z0-9-]/g, "-") : "image";
    const fileName = `${category}/${cleanId}-${timestamp}.webp`;

    // R2에 업로드
    const result = await uploadToR2(webpBuffer, fileName, "image/webp");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "R2 업로드 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      originalSize: file.size,
      compressedSize: webpBuffer.length,
      compressionRatio: ((1 - webpBuffer.length / file.size) * 100).toFixed(1),
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
