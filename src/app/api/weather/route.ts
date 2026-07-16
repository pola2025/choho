import { NextResponse } from "next/server";

/**
 * 기상청 초단기실황 + 초단기예보 → 히어로 날씨 시각화용 정규화 응답
 * 격자 nx=59, ny=133 (초호펜션 37.8641, 126.9347)
 */

const BASE = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";
const WARN_BASE = "https://apis.data.go.kr/1360000/WthrWrnInfoService";
const NX = 59;
const NY = 133;

// 파주 특보구역은 3개로 나뉜다: 파주시남부(L1013730)·서북부(L1013720)·동북부(L1013710).
// 초호펜션(광탄면)이 어느 구역인지 단정하기 어려워, 파주 중 하나라도 발효되면 표시한다.
const AREA_PREFIX = "파주";

// warnVar 코드 → 특보명. 실데이터로 교차검증함
// (6은 바다 구역에만, 5는 해안 육지에만 붙는 것을 확인)
const WARN_NAMES: Record<number, string> = {
  1: "강풍",
  2: "호우",
  3: "한파",
  4: "건조",
  5: "폭풍해일",
  6: "풍랑",
  7: "대설",
  8: "황사",
  9: "태풍",
  12: "폭염",
  13: "열대야",
};

// 10분 캐시 — 실황은 매시각 발표라 더 자주 부를 이유가 없다
export const revalidate = 600;

export type Weather = {
  SKY: 1 | 3 | 4; // 하늘상태: 맑음 / 구름많음 / 흐림
  PTY: number; // 강수형태: 0없음 1비 2비눈 3눈 5빗방울 6빗방울눈날림 7눈날림
  LGT: number; // 낙뢰 (0이면 없음) — 천둥뇌우 판정용. 실황엔 없고 초단기예보에만 있다
  RN1: number; // 1시간 강수량 (mm)
  WSD: number; // 풍속 (m/s)
  VEC: number; // 풍향 (deg, 불어오는 방향)
  T1H: number; // 기온 (°C)
  REH: number; // 습도 (%)
  // 발효 중인 기상특보. 없으면 null → 뱃지에 표기하지 않는다
  warning: { title: string; level: "경보" | "주의보" } | null;
  observedAt: string;
};

// KST 기준 시각 (서버 타임존에 의존하지 않도록 UTC+9로 직접 계산)
function kstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** 초단기실황: 매시 정시 발표, 40분 이후 제공 */
function ncstBase() {
  const d = kstNow();
  if (d.getUTCMinutes() < 40) d.setUTCHours(d.getUTCHours() - 1);
  return { base_date: ymd(d), base_time: String(d.getUTCHours()).padStart(2, "0") + "00" };
}

/** 초단기예보: 매시 30분 발표, 45분 이후 제공 */
function fcstBase() {
  const d = kstNow();
  if (d.getUTCMinutes() < 45) d.setUTCHours(d.getUTCHours() - 1);
  return { base_date: ymd(d), base_time: String(d.getUTCHours()).padStart(2, "0") + "30" };
}

type Item = { category: string; obsrValue?: string; fcstValue?: string; fcstTime?: string };

async function callKma(
  endpoint: string,
  key: string,
  base: { base_date: string; base_time: string },
  numOfRows: number
): Promise<Item[]> {
  const qs = new URLSearchParams({
    serviceKey: key,
    dataType: "JSON",
    numOfRows: String(numOfRows),
    pageNo: "1",
    base_date: base.base_date,
    base_time: base.base_time,
    nx: String(NX),
    ny: String(NY),
  });
  const res = await fetch(`${BASE}/${endpoint}?${qs}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`${endpoint} http ${res.status}`);
  const json = await res.json();
  const header = json?.response?.header;
  if (header?.resultCode !== "00")
    throw new Error(`${endpoint} ${header?.resultMsg ?? "bad response"}`);
  const items = json?.response?.body?.items?.item;
  if (!Array.isArray(items)) throw new Error(`${endpoint} empty items`);
  return items;
}

type PwnItem = { areaName?: string; cancel?: string; warnVar?: number; warnStress?: number };

/**
 * 발효 중인 기상특보. 날짜 파라미터를 빼면 "현재 발효 중"만 내려온다.
 * 특보는 부가 정보라 실패해도 날씨 응답 자체를 막지 않는다.
 */
async function fetchWarning(key: string): Promise<Weather["warning"]> {
  try {
    const qs = new URLSearchParams({
      serviceKey: key,
      dataType: "JSON",
      numOfRows: "300", // 전국 발효 건수가 100을 넘길 수 있다
      pageNo: "1",
    });
    // 특보는 자주 바뀌지 않으므로 캐시를 길게
    const res = await fetch(`${WARN_BASE}/getPwnCd?${qs}`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.response?.header?.resultCode !== "00") return null;
    const items = json?.response?.body?.items?.item;
    if (!Array.isArray(items)) return null;

    const mine = (items as PwnItem[]).filter(
      (i) => String(i.areaName ?? "").startsWith(AREA_PREFIX) && String(i.cancel ?? "0") === "0"
    );
    if (!mine.length) return null;

    // 경보(1)를 주의보(0)보다 먼저
    mine.sort((a, b) => (b.warnStress ?? 0) - (a.warnStress ?? 0));
    const top = mine[0];
    const name = WARN_NAMES[top.warnVar ?? -1];
    if (!name) return null;
    const level = top.warnStress === 1 ? "경보" : "주의보";
    return { title: `${name}${level}`, level };
  } catch {
    return null;
  }
}

export async function GET() {
  const key = process.env.KMA_SERVICE_KEY;
  if (!key) {
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }

  try {
    const [ncst, fcst, warning] = await Promise.all([
      callKma("getUltraSrtNcst", key, ncstBase(), 20),
      callKma("getUltraSrtFcst", key, fcstBase(), 60),
      fetchWarning(key),
    ]);

    const obs = (c: string) => ncst.find((i) => i.category === c)?.obsrValue;
    // SKY·LGT는 실황에 없어 예보의 가장 이른 시각 값을 쓴다
    const earliestFcst = (cat: string) =>
      fcst
        .filter((i) => i.category === cat)
        .sort((a, b) => (a.fcstTime ?? "").localeCompare(b.fcstTime ?? ""))[0]?.fcstValue;
    const sky = earliestFcst("SKY");
    const lgt = earliestFcst("LGT");

    const num = (v: string | undefined, fallback: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const skyN = num(sky, 1);
    const weather: Weather = {
      SKY: (skyN === 3 || skyN === 4 ? skyN : 1) as 1 | 3 | 4,
      PTY: num(obs("PTY"), 0),
      LGT: num(lgt, 0),
      // 강수 없을 때 "강수없음" 같은 문자열이 오므로 숫자 아니면 0
      RN1: num(obs("RN1"), 0),
      WSD: num(obs("WSD"), 1),
      VEC: num(obs("VEC"), 270),
      T1H: num(obs("T1H"), 20),
      REH: num(obs("REH"), 50),
      warning,
      observedAt: new Date().toISOString(),
    };

    return NextResponse.json(weather, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" },
    });
  } catch {
    // 날씨는 부가 연출이므로 실패해도 내부 정보 노출 없이 조용히 실패시킨다
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
