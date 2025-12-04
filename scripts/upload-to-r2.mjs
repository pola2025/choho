#!/usr/bin/env node
/**
 * 이미지를 WebP로 변환하고 Cloudflare R2에 업로드하는 스크립트
 *
 * 사용법: node scripts/upload-to-r2.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// .env.local 로드
dotenv.config({ path: path.join(rootDir, '.env.local') });

// R2 설정
const R2_CONFIG = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET_NAME,
  endpoint: process.env.R2_ENDPOINT,
  publicUrl: process.env.R2_PUBLIC_URL,
};

// 설정 검증
if (!R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey || !R2_CONFIG.bucket || !R2_CONFIG.endpoint) {
  console.error('❌ R2 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  process.exit(1);
}

// S3 클라이언트 생성 (R2는 S3 호환)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

// 변환할 이미지 목록 (public/images/hero 폴더)
const IMAGE_DIR = path.join(rootDir, 'public/images/hero');
const OUTPUT_DIR = path.join(rootDir, 'public/images/hero/webp');

// WebP 변환 옵션 (최대 압축 - 99% 절감 목표)
const WEBP_OPTIONS = {
  quality: 60,           // 품질 (0-100) - 60으로 낮춤 (최대 압축)
  effort: 6,             // 압축 노력 (0-6, 최대)
  lossless: false,       // 손실 압축
  smartSubsample: true,  // 스마트 크로마 서브샘플링
};

// 히어로 이미지 크기 (고해상도 유지)
const HERO_SIZES = {
  full: { width: 1920, height: 1080 },      // 데스크톱 풀 HD
  large: { width: 1280, height: 720 },      // 태블릿/작은 데스크톱
  medium: { width: 768, height: 432 },      // 태블릿
  small: { width: 480, height: 270 },       // 모바일
};

/**
 * 이미지를 WebP로 변환
 */
async function convertToWebP(inputPath, outputPath, options = {}) {
  const { width, height } = options;

  let pipeline = sharp(inputPath);

  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'cover',
      position: 'center',
    });
  }

  await pipeline.webp(WEBP_OPTIONS).toFile(outputPath);

  const inputStats = fs.statSync(inputPath);
  const outputStats = fs.statSync(outputPath);
  const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

  return {
    inputSize: inputStats.size,
    outputSize: outputStats.size,
    reduction,
  };
}

/**
 * R2에 파일 업로드
 */
async function uploadToR2(filePath, key, contentType = 'image/webp') {
  const fileBuffer = fs.readFileSync(filePath);

  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable', // 1년 캐시
  });

  await s3Client.send(command);

  return `${R2_CONFIG.publicUrl}/${key}`;
}

/**
 * 바이트를 읽기 쉬운 형태로 변환
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 메인 함수
 */
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    console.log('🔍 Dry-run 모드: 실제 업로드 없이 시뮬레이션합니다.\n');
  }

  console.log('📸 이미지 WebP 변환 및 R2 업로드 시작\n');

  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // JPG 파일 목록 가져오기
  const imageFiles = fs.readdirSync(IMAGE_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('❌ 변환할 이미지가 없습니다.');
    return;
  }

  console.log(`📁 발견된 이미지: ${imageFiles.length}개\n`);

  const results = [];

  for (const file of imageFiles) {
    const inputPath = path.join(IMAGE_DIR, file);
    const baseName = path.parse(file).name.toLowerCase();

    console.log(`\n🖼️  처리 중: ${file}`);

    // 풀 사이즈 WebP 변환
    const fullOutputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);
    const fullResult = await convertToWebP(inputPath, fullOutputPath, HERO_SIZES.full);

    console.log(`   ✅ 변환 완료: ${formatBytes(fullResult.inputSize)} → ${formatBytes(fullResult.outputSize)} (${fullResult.reduction}% 감소)`);

    // R2 업로드
    const r2Key = `hero/${baseName}.webp`;
    let publicUrl = `${R2_CONFIG.publicUrl}/${r2Key}`;

    if (!dryRun) {
      publicUrl = await uploadToR2(fullOutputPath, r2Key);
      console.log(`   ☁️  업로드 완료: ${publicUrl}`);
    } else {
      console.log(`   ☁️  [DRY-RUN] 업로드 예정: ${publicUrl}`);
    }

    results.push({
      original: file,
      webp: `${baseName}.webp`,
      url: publicUrl,
      originalSize: fullResult.inputSize,
      webpSize: fullResult.outputSize,
      reduction: fullResult.reduction,
    });
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 변환 결과 요약\n');

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalWebp = results.reduce((sum, r) => sum + r.webpSize, 0);
  const totalReduction = ((1 - totalWebp / totalOriginal) * 100).toFixed(1);

  console.log(`   원본 총 크기: ${formatBytes(totalOriginal)}`);
  console.log(`   WebP 총 크기: ${formatBytes(totalWebp)}`);
  console.log(`   총 절감량: ${totalReduction}%\n`);

  console.log('📋 업로드된 URL 목록:\n');
  results.forEach(r => {
    console.log(`   ${r.url}`);
  });

  // site-images.ts 업데이트용 코드 출력
  console.log('\n📝 site-images.ts 업데이트용 코드:\n');
  console.log('hero: [');
  results.forEach((r, i) => {
    const id = `hero-${i + 1}`;
    const name = `히어로 ${i + 1}`;
    console.log(`  { id: "${id}", name: "${name}", src: "${r.url}", usedIn: ["Hero.tsx"], description: "겨울 시즌 히어로 이미지" },`);
  });
  console.log('],');

  console.log('\n✨ 완료!');
}

main().catch(console.error);
