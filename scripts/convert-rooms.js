const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGET_SIZE = 500 * 1024; // 500KB

// 폴더 → slug 매핑
const roomMappings = [
  { src: 'docs/img/호수뷰객실', slug: 'lakeview' },
  { src: 'docs/img/forest', slug: 'forest' },
  { src: 'docs/img/forestmini', slug: 'forest-mini' },
  { src: 'docs/img/Forest 패밀리', slug: 'forest-family' },
  { src: 'docs/img/Forest 미니패밀리', slug: 'forest-mini-family' },
];

async function compressToTarget(inputPath, outputPath, maxSize = TARGET_SIZE) {
  let quality = 80;
  let width = 1600;

  while (quality >= 40) {
    await sharp(inputPath)
      .rotate() // EXIF 기반 자동 회전
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    if (stat.size <= maxSize) {
      return stat.size;
    }

    quality -= 5;
    if (quality < 60) width = 1400;
    if (quality < 50) width = 1200;
  }

  return fs.statSync(outputPath).size;
}

async function processRoom(srcDir, slug) {
  const basePath = 'F:/choho_2025';
  const fullSrcDir = path.join(basePath, srcDir);
  const destDir = path.join(basePath, 'public/images/rooms', slug);

  if (!fs.existsSync(fullSrcDir)) {
    console.log(`  ⚠ 폴더 없음: ${srcDir}`);
    return { images: [], thumbnail: null };
  }

  // 출력 폴더 생성
  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(fullSrcDir)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  const images = [];
  let thumbnail = null;

  for (const file of files) {
    const srcPath = path.join(fullSrcDir, file);
    const isMain = /^main\.(jpg|jpeg|png)$/i.test(file);
    const baseName = isMain ? 'main' : path.basename(file, path.extname(file)).toLowerCase();
    const destPath = path.join(destDir, `${baseName}.webp`);

    try {
      const size = await compressToTarget(srcPath, destPath);
      const sizeKB = (size / 1024).toFixed(0);
      console.log(`    ✓ ${file} → ${baseName}.webp (${sizeKB}KB)`);

      const webPath = `/images/rooms/${slug}/${baseName}.webp`;

      if (isMain) {
        thumbnail = webPath;
      } else {
        images.push(webPath);
      }
    } catch (err) {
      console.log(`    ✗ ${file}: ${err.message}`);
    }
  }

  return { images, thumbnail };
}

async function main() {
  console.log('=== 객실 이미지 WebP 변환 시작 ===\n');

  const results = {};

  for (const room of roomMappings) {
    console.log(`\n[${room.slug}] ${room.src}`);
    const result = await processRoom(room.src, room.slug);
    results[room.slug] = result;
  }

  console.log('\n\n=== 변환 완료 ===');
  console.log('\n--- data.ts 업데이트용 경로 ---');

  for (const [slug, data] of Object.entries(results)) {
    console.log(`\n${slug}:`);
    console.log(`  thumbnail: "${data.thumbnail || '/images/rooms/' + slug + '/main.webp'}"`);
    console.log(`  images: [`);
    data.images.slice(0, 5).forEach(img => console.log(`    "${img}",`));
    if (data.images.length > 5) console.log(`    // ... ${data.images.length - 5} more`);
    console.log(`  ]`);
  }
}

main().catch(console.error);
