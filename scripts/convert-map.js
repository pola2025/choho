const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'F:/choho_2025/docs/img/442eeb10cfffb.jpg';
const outputDir = 'F:/choho_2025/public/images/location';
const outputPath = path.join(outputDir, 'map.webp');

// 출력 디렉토리 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convert() {
  try {
    const info = await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log('✅ 변환 완료:', outputPath);
    console.log('크기:', info.width, 'x', info.height);
    console.log('파일 크기:', (info.size / 1024).toFixed(1), 'KB');
  } catch (err) {
    console.error('❌ 에러:', err.message);
  }
}

convert();
