const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const images = [
  {
    input: 'F:/choho_2025/docs/img/9baadcf917c6c.jpg',
    output: 'F:/choho_2025/public/images/hero/rooms-hero.webp',
    name: '객실안내'
  },
  {
    input: 'F:/choho_2025/docs/img/초리골164/285A4803.jpg',
    output: 'F:/choho_2025/public/images/hero/cafe-hero.webp',
    name: '초리골164카페'
  },
  {
    input: 'F:/choho_2025/docs/img/히스토리/DSC01901.JPG',
    output: 'F:/choho_2025/public/images/hero/about-hero.webp',
    name: '초호역사'
  },
  {
    input: 'F:/choho_2025/docs/img/히스토리/DSC02065.JPG',
    output: 'F:/choho_2025/public/images/hero/location-hero.webp',
    name: '오시는길'
  }
];

async function convertImages() {
  // hero 폴더 생성
  const heroDir = 'F:/choho_2025/public/images/hero';
  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true });
  }

  for (const img of images) {
    try {
      console.log(`\n변환 중: ${img.name}`);
      console.log(`입력: ${img.input}`);

      // 이미지 메타데이터 확인
      const metadata = await sharp(img.input).metadata();
      console.log(`원본 크기: ${metadata.width}x${metadata.height}`);

      // webp로 변환 (품질 조절하여 500KB 이하로)
      let quality = 80;
      let outputBuffer;
      let fileSize;

      do {
        outputBuffer = await sharp(img.input)
          .resize(1920, 1080, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality })
          .toBuffer();

        fileSize = outputBuffer.length;
        console.log(`품질 ${quality}: ${(fileSize / 1024).toFixed(0)}KB`);

        if (fileSize > 500 * 1024) {
          quality -= 10;
        }
      } while (fileSize > 500 * 1024 && quality > 20);

      // 파일 저장
      fs.writeFileSync(img.output, outputBuffer);
      console.log(`저장됨: ${img.output} (${(fileSize / 1024).toFixed(0)}KB)`);

    } catch (error) {
      console.error(`오류 (${img.name}):`, error.message);
    }
  }

  console.log('\n모든 이미지 변환 완료!');
}

convertImages();
