// 저널 신규 1건 추가: 시원한 여름 프로모션(더초리골 수영장 무료입장권) — 멱등(동일 id 삭제 후 삽입)
// 800x1120 안내 이미지를 R2(journal/summer-pool-promo/)에 올린 뒤 D1 journals에 INSERT
// 실행: node scripts/insert-summer-pool-promo-journal.mjs
//       node scripts/insert-summer-pool-promo-journal.mjs --dry  (미삽입, 행 출력만)
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

const id = "summer-pool-promo-2026";
const base = `${R2}/journal/summer-pool-promo`;
const localImage = "F:/choho_2025/public/images/pool/popup-summer-promo-800.png";
const key = "journal/summer-pool-promo/summer-pool-promo-800.png";

const row = {
  id,
  title: "시원한 여름 프로모션 — 더초리골 수영장 무료입장권 안내",
  excerpt:
    "8월 3일(월)부터 8월 16일(일)까지 입실하시는 고객님께 더초리골 수영장 무료입장권 2매를 드립니다. 무료 2매를 제외한 나머지 인원은 50% 할인권으로 제공되며, 객실 예약 시 사전 신청이 필요합니다.",
  content: `무더위가 이어지는 8월, 초호펜션에서 시원한 여름 프로모션을 준비했습니다.
8월 3일(월)부터 8월 16일(일)까지 입실하시는 고객님께 더초리골 수영장 입장권을 드립니다.

■ 제공 혜택
- 무료입장권 2매
- 무료 2매를 제외한 나머지 인원은 50% 할인권으로 제공 (객실 이용인원 기준)

■ 이용 예시
- Forest 4인 예약 → 무료입장권 2매 + 50% 할인권 2매
- 호수뷰 객실 6인 예약 → 무료입장권 2매 + 50% 할인권 4매

■ 신청 방법
- 객실 예약 시 사전 신청해 주셔야 합니다.
- 당일 입실 시에는 신청이 불가합니다.
- 수영장 방문 전 초호펜션 관리자에게 쿠폰을 수령하신 뒤 입장해 주세요.

■ 이용 조건
- 무료입장권은 주간 / 야간 중 하나를 선택해 사용하실 수 있습니다. (종일 사용 불가)
- 50% 할인권은 종일권 구매 시에도 할인 적용이 가능합니다.
- 수영장 야간개장은 주말에만 운영합니다. (평일 야간 미운영)
- 호수뷰 객실이 미오픈인 평일에 이용을 원하시면 관리자에게 개별 연락 부탁드립니다.
- 평상은 더초리골 현장에서 직접 결제·이용하시며 사전 예약은 불가합니다. (더초리골 규정)

시원한 물놀이와 함께 여름 휴가 보내시길 바랍니다.

문의: 010-7932-0029`,
  category: "notice",
  thumbnail: `${base}/summer-pool-promo-800.png`,
  images: `${base}/summer-pool-promo-800.png`,
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
