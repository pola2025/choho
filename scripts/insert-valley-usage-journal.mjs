// 저널 신규 1건: 초호쉼터 계곡 이용 안내 (2026.7.19) — 멱등(동일 id 삭제 후 삽입)
// R2 이미지 업로드(썸네일 1:1 + 상세 히어로) 후 D1 INSERT.
// 실행: node scripts/insert-valley-usage-journal.mjs        (업로드+삽입)
//       node scripts/insert-valley-usage-journal.mjs --dry  (미실행, 행 출력만)
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const env = {};
for (const line of fs.readFileSync("F:/choho_2025/.env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const PROXY = env.D1_PROXY_URL, TOKEN = env.D1_PROXY_TOKEN, R2 = env.R2_PUBLIC_URL;
const DRY = process.argv.includes("--dry");

const id = "valley-open-2026-0719";
const slug = "valley-open-0719";
const base = `${R2}/journal/${slug}`;
const localDir = "F:/choho_2025/public/images/journal/valley-open-0719";
const assets = [
  { file: "thumb-1080.webp", key: `journal/${slug}/thumb-1080.webp` },
  { file: "hero-1600.webp", key: `journal/${slug}/hero-1600.webp` },
];

const row = {
  id,
  title: "초호쉼터 계곡 이용 안내",
  excerpt:
    "충분한 수량이 확보되어 계곡 이용이 가능합니다. 평상시 수심 20~40cm(깊은 곳 60~70cm)로 아이들이 놀기 좋아요. 펜션 투숙객 전용, 오후 6시까지 이용 가능합니다. (음주·화기·다이빙 등 제한)",
  content: `충분한 수량이 확보되어 초호쉼터 계곡 이용이 가능합니다.
펜션을 이용하시면서 시원하게 흐르는 계곡에서 여름 휴식을 즐겨보세요.

🏡 계곡은 펜션 이용 고객(투숙객)에 한해 이용 가능합니다.

🕕 이용 시간
- 계곡 이용은 오후 6시(18:00)까지 가능합니다.

💧 이용 안내
- 평상시 수심은 20~40cm(발목~종아리)이며, 깊은 곳도 60~70cm 수준으로 어린이들이 놀기 좋습니다.
- 수량은 강우량에 따라 달라질 수 있습니다.
- 안전을 위해 어린이는 보호자와 함께 이용해 주세요.

⚠️ 이용 제한 사항
- 계곡 내 음주는 제한됩니다.
- 계곡 내 의자·테이블 반입 및 이용은 제한됩니다.
- 취사·바베큐 등 화기 사용은 금지됩니다.
- 다이빙 및 유리병 반입은 금지됩니다.
- 음주 후 입수는 삼가 주세요.
- 쓰레기는 되가져가 주세요.
- 기상상황에 따라 안전을 위해 출입이 제한될 수 있습니다.

쾌적하고 안전한 계곡 이용을 위해 협조 부탁드립니다.

문의: 010-7932-0029`,
  category: "notice",
  thumbnail: `${base}/thumb-1080.webp`,
  images: [`${base}/hero-1600.webp`].join(", "),
  createdAt: "2026-07-19",
};

if (DRY) {
  console.log(JSON.stringify(row, null, 2));
  console.log("\n[--dry] 업로드/삽입하지 않음");
  process.exit(0);
}

// 1) R2 업로드
const s3 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});
for (const a of assets) {
  const body = fs.readFileSync(path.join(localDir, a.file));
  await s3.send(
    new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: a.key, Body: body, ContentType: "image/webp" })
  );
  console.log(`R2 OK  ${a.key}`);
}

// 2) D1 INSERT (멱등)
const statements = [
  { sql: `DELETE FROM journals WHERE id = ?`, params: [id] },
  {
    sql: `INSERT INTO journals (id, title, excerpt, content, category, thumbnail, images, createdAt, viewCount, "order", isPublished)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)`,
    params: [row.id, row.title, row.excerpt, row.content, row.category, row.thumbnail, row.images, row.createdAt],
  },
];
const r = await fetch(`${PROXY}/batch`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ statements }),
});
const j = await r.json().catch(() => ({}));
if (!r.ok || !j.success) throw new Error(`D1 batch: ${r.status} ${j.message || j.error}`);
console.log(`저널 삽입 완료: ${id}  (${row.title})`);
