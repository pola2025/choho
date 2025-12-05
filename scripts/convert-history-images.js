const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceDir = 'F:/choho_2025/docs/img/히스토리';
const outputDir = 'F:/choho_2025/public/images/history';

// 이미지 파일 매핑 (원본 파일명 -> 출력 파일명)
const imageMapping = [
  { source: '면장시절법원교 건립당시.jpg', output: 'history-1-bridge.webp', year: '1960' },
  { source: '초호정에서 라이온스 회장취임식.jpg', output: 'history-2-lions.webp', year: '1968' },
  { source: '초호정 배경사진.jpg', output: 'history-3-chohojung.webp', year: '1991' },
  { source: '외부전경 (12).JPG', output: 'history-4-exterior.webp', year: '1997' },
  { source: 'KakaoTalk_20180614_104304879.jpg', output: 'history-5-facility.webp', year: '2008' },
  { source: 'KakaoTalk_20180614_104306166.jpg', output: 'history-6-cafe.webp', year: '2021' },
  { source: 'DSC01901.JPG', output: 'history-7-current.webp', year: '2025' },
];

async function convertImages() {
  // 출력 디렉토리 확인
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const img of imageMapping) {
    const sourcePath = path.join(sourceDir, img.source);
    const outputPath = path.join(outputDir, img.output);

    if (!fs.existsSync(sourcePath)) {
      console.log(`❌ 파일 없음: ${img.source}`);
      continue;
    }

    try {
      await sharp(sourcePath)
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✅ ${img.source} → ${img.output} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`❌ 변환 실패 (${img.source}):`, error.message);
    }
  }

  console.log('\n완료!');
}

convertImages();
