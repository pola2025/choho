const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'docs/img/초리골164';
const destDir = 'public/images/cafe';

// Ensure dest dir exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

const nameMap = {
  '285A4798.jpg': 'exterior-1.webp',
  '285A4803.jpg': 'exterior-2.webp',
  '285A4805.jpg': 'terrace.webp',
  '285A4808.jpg': 'interior-1.webp',
  '285A4809.jpg': 'interior-2.webp',
  '285A4810.jpg': 'interior-3.webp',
  '285A4812.jpg': 'interior-4.webp',
  'DSC_1391.jpg': 'bakery.webp',
  'DSC_3767.JPG': 'walnut-cake.webp'
};

async function processImages() {
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destName = nameMap[file] || file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const destPath = path.join(destDir, destName);

    // Start with quality 80, reduce if needed
    let quality = 80;
    let result;

    do {
      result = await sharp(srcPath)
        .resize(1920, 1280, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

      if (result.length > 500 * 1024 && quality > 30) {
        quality -= 10;
      } else {
        break;
      }
    } while (result.length > 500 * 1024);

    fs.writeFileSync(destPath, result);
    console.log(`${file} -> ${destName} (${Math.round(result.length / 1024)}kb, q${quality})`);
  }
}

processImages().then(() => console.log('Done!')).catch(console.error);
