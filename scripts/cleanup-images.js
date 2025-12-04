const fs = require('fs');
const path = require('path');

// 사용되는 이미지 목록 (data.ts 기준)
const usedImages = {
  lakeview: ['main.webp', '33b7b5a1c1d9c.webp', '5813e8a445dcd.webp', 'ec404e547ee96.webp', '969b5f7afc30b.webp', 'cd1a71ba83636.webp'],
  forest: ['main.webp', '0062fb88ef43a.webp', '10e393b267d20.webp', '15fddc2a64e6c.webp', '2779cfff43741.webp'],
  'forest-mini': ['main.webp', '022d94fa1e442.webp', '0397a69dd4d14.webp', '0c3490a0b45aa.webp'],
  'forest-family': ['main.webp', '20230428_131830.webp', '20230428_131914.webp', '20230428_132005.webp', '20230428_132047.webp'],
  'forest-mini-family': ['main.webp', '20230428_132325_1.webp', '20230428_132427_1.webp', '20230428_132548_1.webp'],
};

const roomsDir = 'F:/choho_2025/public/images/rooms';

let deletedCount = 0;
let keptCount = 0;

Object.keys(usedImages).forEach(room => {
  const roomDir = path.join(roomsDir, room);

  if (!fs.existsSync(roomDir)) {
    console.log(`❌ 폴더 없음: ${roomDir}`);
    return;
  }

  const files = fs.readdirSync(roomDir);

  files.forEach(file => {
    if (usedImages[room].includes(file)) {
      keptCount++;
      console.log(`✅ 유지: ${room}/${file}`);
    } else {
      const filePath = path.join(roomDir, file);
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`🗑️ 삭제: ${room}/${file}`);
    }
  });
});

console.log('\n========== 결과 ==========');
console.log(`유지된 파일: ${keptCount}개`);
console.log(`삭제된 파일: ${deletedCount}개`);
