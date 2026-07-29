// 저널 신규 1건 추가: 패밀리 객실 이용인원 안내 — 멱등(동일 id 삭제 후 삽입)
// 800x800 안내 이미지를 R2(journal/family-capacity/)에 올린 뒤 D1 journals에 INSERT
// 실행: node scripts/insert-family-capacity-journal.mjs
//       node scripts/insert-family-capacity-journal.mjs --dry  (미삽입, 행 출력만)
import fs from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const env = {};
for (const line of fs.readFileSync("F:/choho_2025/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const PROXY = env.D1_PROXY_URL,
  TOKEN = env.D1_PROXY_TOKEN,
  R2 = env.R2_PUBLIC_URL;
const DRY = process.argv.includes("--dry");

const id = "family-room-capacity-guide";
const base = `${R2}/journal/family-capacity`;
const localImage = "F:/choho_2025/wireframes/family-capacity-square-800.png";
const key = "journal/family-capacity/capacity-guide-800.png";

const row = {
  id,
  title: "패밀리 객실 이용인원 안내",
  excerpt:
    "포레스트 패밀리는 정원 4명 + 유아 1명, 포레스트 미니패밀리는 정원 2명 + 유아 1명까지 이용 가능합니다. 36개월 이상 어린이·청소년은 모두 정원에 포함됩니다.",
  content: `패밀리 객실 이용인원을 문의해 주시는 분들이 많아 안내드립니다.

■ 정원 계산 기준
정원은 나이와 관계없이 계산됩니다. 36개월 이상이면 어린이·청소년도 어른과 똑같이 정원 1명에 해당합니다. 한 가족이어도 동일하게 적용됩니다.
여기에 추가할 수 있는 인원은 36개월 미만 유아 1명뿐이며, 이 유아도 인원에는 포함되고 요금만 부과되지 않습니다.

■ Forest 패밀리룸 — 정원 4명 + 유아 1명
- 36개월 이상 어린이·청소년은 모두 정원에 해당
- 어른 5명 이용 불가
- 정원 4명 + 유아 1명까지만 가능
- 유아 기준: 36개월 미만
- 36개월 미만 아동도 인원에는 포함 (요금 미부과)

■ Forest Mini 패밀리룸 — 정원 2명 + 유아 1명
- 어른 2명 + 유아 1명, 한 가족만 이용 가능
- 어른 3명 이용 불가
- 36개월 이상 어린이·청소년은 모두 정원에 해당
- 유아 기준: 36개월 미만
- 36개월 미만 아동도 인원에는 포함 (요금 미부과)

■ 헷갈리기 쉬운 사례 (Forest 패밀리룸 기준)
- 부부 + 어린이 2명 + 유아 1명 → 이용 가능 (정원 4명 + 유아 1명)
- 부부 + 어린이 3명 → 이용 불가 (어린이도 정원 인원이라 정원 5명)
- 어른 3명 + 어린이 1명 + 유아 2명 → 이용 불가 (이미 정원 4명, 유아도 인원이라 총 6명)

■ 유의사항
- 최대인원 초과 시 입실이 불가능할 수 있습니다.
- 기준 및 최대인원 준수 바랍니다.

문의: 010-7932-0029`,
  category: "notice",
  thumbnail: `${base}/capacity-guide-800.png`,
  images: `${base}/capacity-guide-800.png`,
  createdAt: new Date().toISOString().slice(0, 10),
};

const statements = [
  { sql: `DELETE FROM journals WHERE id = ?`, params: [id] },
  {
    sql: `INSERT INTO journals (id, title, excerpt, content, category, thumbnail, images, createdAt, viewCount, "order", isPublished)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)`,
    params: [
      row.id,
      row.title,
      row.excerpt,
      row.content,
      row.category,
      row.thumbnail,
      row.images,
      row.createdAt,
    ],
  },
];

if (DRY) {
  console.log(JSON.stringify(row, null, 2));
  console.log("\n[--dry] 업로드/삽입하지 않음");
  process.exit(0);
}

// 1) R2 업로드
const s3 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
await s3.send(
  new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: fs.readFileSync(localImage),
    ContentType: "image/png",
  })
);
console.log(`R2 OK  ${key}`);

// 2) D1 INSERT
const r = await fetch(`${PROXY}/batch`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ statements }),
});
const j = await r.json().catch(() => ({}));
if (!r.ok || !j.success) throw new Error(`D1 batch: ${r.status} ${j.message || j.error}`);
console.log(`D1 OK  ${id} (${row.createdAt})`);
