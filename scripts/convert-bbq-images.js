const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'docs/bbq';
const OUTPUT_DIR = 'public/images/bbq';

// 출력 디렉토리 생성
const categories = ['burner', 'forest', 'lakeview'];
categories.forEach(cat => {
  const dir = path.join(OUTPUT_DIR, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function convertImage(inputPath, outputPath, targetSize = 100 * 1024) {
  let quality = 80;
  let buffer;

  // 원본 이미지 정보
  const metadata = await sharp(inputPath).metadata();
  console.log(`Processing: ${inputPath} (${metadata.width}x${metadata.height})`);

  // 리사이즈 (최대 1920px)
  let width = Math.min(metadata.width, 1920);

  // 품질 조정하면서 100kb 이하로 만들기
  while (quality >= 20) {
    buffer = await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    if (buffer.length <= targetSize) {
      break;
    }

    // 품질 낮추기
    quality -= 10;

    // 품질로 안되면 크기도 줄이기
    if (quality < 30 && buffer.length > targetSize) {
      width = Math.floor(width * 0.8);
      quality = 60;
    }
  }

  await fs.promises.writeFile(outputPath, buffer);
  console.log(`  -> ${outputPath} (${(buffer.length / 1024).toFixed(1)}KB, quality: ${quality})`);

  return buffer.length;
}

async function main() {
  console.log('BBQ 이미지 변환 시작...\n');

  const conversions = [
    // Burner (가스버너 & 캠핑그릴)
    { src: 'docs/bbq/burner/DSC03091.JPG', dest: 'public/images/bbq/burner/burner-1.webp' },
    { src: 'docs/bbq/burner/DSC03093.jpg', dest: 'public/images/bbq/burner/burner-2.webp' },

    // Forest Room (숯불바베큐)
    { src: 'docs/bbq/forest_room/DSC02055.JPG', dest: 'public/images/bbq/forest/forest-1.webp' },
    { src: 'docs/bbq/forest_room/DSC02062.JPG', dest: 'public/images/bbq/forest/forest-2.webp' },
    { src: 'docs/bbq/forest_room/DSC02064.JPG', dest: 'public/images/bbq/forest/forest-3.webp' },

    // Lakeview Room (호수뷰 객실)
    { src: 'docs/bbq/lakeside_room/1a602edc7a848.jpg', dest: 'public/images/bbq/lakeview/lakeview-1.webp' },
    { src: 'docs/bbq/lakeside_room/DSC_3200.JPG', dest: 'public/images/bbq/lakeview/lakeview-2.webp' },
    { src: 'docs/bbq/lakeside_room/DSC_3205.JPG', dest: 'public/images/bbq/lakeview/lakeview-3.webp' },
  ];

  let totalSize = 0;

  for (const { src, dest } of conversions) {
    try {
      const size = await convertImage(src, dest);
      totalSize += size;
    } catch (err) {
      console.error(`Error processing ${src}:`, err.message);
    }
  }

  console.log(`\n완료! 총 ${(totalSize / 1024).toFixed(1)}KB`);
}

main().catch(console.error);
