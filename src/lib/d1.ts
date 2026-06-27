/**
 * D1 클라이언트 — choho-d1-proxy Worker를 통해 Cloudflare D1 접근.
 * Airtable 대체. 서버 사이드 전용 (D1_PROXY_TOKEN 노출 금지).
 */

const D1_PROXY_URL = process.env.D1_PROXY_URL;
const D1_PROXY_TOKEN = process.env.D1_PROXY_TOKEN;

export function isD1Configured(): boolean {
  return Boolean(D1_PROXY_URL && D1_PROXY_TOKEN);
}

type Param = string | number | null;
export interface D1Statement {
  sql: string;
  params?: Param[];
}

async function call(path: string, body: unknown) {
  if (!D1_PROXY_URL || !D1_PROXY_TOKEN) {
    throw new Error("D1 proxy가 설정되지 않았습니다 (D1_PROXY_URL/D1_PROXY_TOKEN)");
  }
  const res = await fetch(`${D1_PROXY_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${D1_PROXY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(`D1 ${path} 실패: ${res.status} ${data?.message || data?.error || ""}`);
  }
  return data;
}

/** SELECT — 행 배열 반환 */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = []
): Promise<T[]> {
  const data = await call("/query", { sql, params });
  return (data.results || []) as T[];
}

/** SELECT 단건 — 첫 행 또는 null */
export async function d1First<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = []
): Promise<T | null> {
  const rows = await d1Query<T>(sql, params);
  return rows[0] ?? null;
}

/** INSERT/UPDATE/DELETE 단건 */
export async function d1Run(sql: string, params: Param[] = []): Promise<void> {
  await call("/query", { sql, params });
}

/** 트랜잭션 배치 (원자적) */
export async function d1Batch(statements: D1Statement[]): Promise<void> {
  if (statements.length === 0) return;
  await call("/batch", { statements });
}

/** 컬럼/값 맵으로 INSERT문 생성 헬퍼 */
export function buildInsert(table: string, row: Record<string, Param>): D1Statement {
  const cols = Object.keys(row);
  const placeholders = cols.map(() => "?").join(", ");
  const quoted = cols.map((c) => `"${c}"`).join(", ");
  return {
    sql: `INSERT INTO ${table} (${quoted}) VALUES (${placeholders})`,
    params: cols.map((c) => row[c]),
  };
}
