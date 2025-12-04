const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    return true;
  } catch (err) {
    console.error(`✗ ${path.basename(inputPath)}: ${err.message}`);
    return false;
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      await convertToWebP(filePath, webpPath);
      // 원본 삭제
      fs.unlinkSync(filePath);
      console.log(`  삭제: ${file}`);
    }
  }
}

async function copyAndConvert(srcDir, destDir, prefix = '') {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  for (let i = 0; i < files.length; i++) {
    const srcPath = path.join(srcDir, files[i]);
    const destName = prefix ? `${prefix}${i + 1}.webp` : files[i].replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const destPath = path.join(destDir, destName);
    await convertToWebP(srcPath, destPath);
  }
}

async function main() {
  console.log('=== 이미지 WebP 변환 시작 ===\n');

  // 1. 체크인 이미지 변환
  console.log('1. 체크인 이미지 변환');
  const checkinSrc = 'F:/choho_2025/docs/img/체크인안내';
  const checkinDest = 'F:/choho_2025/public/images/checkin';

  // 기존 jpg 삭제
  if (fs.existsSync(checkinDest)) {
    fs.readdirSync(checkinDest).forEach(f => {
      if (/\.jpg$/i.test(f)) fs.unlinkSync(path.join(checkinDest, f));
    });
  }
  await copyAndConvert(checkinSrc, checkinDest, '');

  // 2. 바베큐시설 이미지 변환
  console.log('\n2. 바베큐시설 이미지 변환');
  const bbqSrc = 'F:/choho_2025/docs/img/바베큐시설';
  const bbqDest = 'F:/choho_2025/public/images/bbq';
  await copyAndConvert(bbqSrc, bbqDest, 'bbq-');

  // 3. 기존 rooms 이미지 변환
  console.log('\n3. 객실 이미지 변환');
  const roomsDir = 'F:/choho_2025/public/images/rooms';
  if (fs.existsSync(roomsDir)) {
    await processDirectory(roomsDir);
  }

  // 4. hero 이미지 변환 (있다면)
  console.log('\n4. Hero 이미지 변환');
  const heroDir = 'F:/choho_2025/public/images/hero';
  if (fs.existsSync(heroDir)) {
    await processDirectory(heroDir);
  }

  console.log('\n=== 변환 완료 ===');
}

main().catch(console.error);
