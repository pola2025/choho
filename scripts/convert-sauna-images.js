const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceDir = 'F:/choho_2025/docs/img/사우나';
const outputDir = 'F:/choho_2025/public/images/history';

// 불한증막 이미지 매핑
const imageMapping = [
  // 메인 히어로 이미지 (큰 사이즈)
  { source: 'batch_DSC08309.JPG', output: 'sauna-hero.webp', size: { width: 1920, height: 1080 } },
  // 추가 갤러리 이미지 (나중에 사용할 수 있도록)
  { source: 'batch_DSC08307.JPG', output: 'sauna-1-overview.webp', size: { width: 800, height: 600 } },
  { source: 'batch_DSC08308.JPG', output: 'sauna-2-side.webp', size: { width: 800, height: 600 } },
  { source: 'batch_DSC08310.JPG', output: 'sauna-3-front.webp', size: { width: 800, height: 600 } },
  { source: 'batch_DSC08311.JPG', output: 'sauna-4-entrance.webp', size: { width: 800, height: 600 } },
];

async function convertImages() {
  // 출력 디렉토리 확인
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🔥 불한증막 이미지 변환 시작...\n');

  for (const img of imageMapping) {
    const sourcePath = path.join(sourceDir, img.source);
    const outputPath = path.join(outputDir, img.output);

    if (!fs.existsSync(sourcePath)) {
      console.log(`❌ 파일 없음: ${img.source}`);
      continue;
    }

    try {
      await sharp(sourcePath)
        .resize(img.size.width, img.size.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✅ ${img.source} → ${img.output} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`❌ 변환 실패 (${img.source}):`, error.message);
    }
  }

  console.log('\n🎉 불한증막 이미지 변환 완료!');
}

convertImages();
