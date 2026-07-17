"use client";

import { useEffect, useRef, useState } from "react";
import {
  events,
  fmtKST,
  julianDay,
  limbAngle,
  moonPhase,
  moonPos,
  phaseEmoji,
  phaseName,
  sunPos,
  type Phase,
} from "@/lib/astro";

/* =============================================
 * 히어로 날씨: 뱃지 + 그 아래 컬럼
 * 기상청 실황값(SKY·PTY·LGT·RN1·WSD·VEC)을 그대로 시각으로 변환한다.
 * 전체화면이 아니라 뱃지 폭 안에서만 그리므로 부담이 작다.
 *
 * 밤에는 해 자리에 그날의 달이 뜬다. 위상·기울기·고도는 전부 계산값(@/lib/astro).
 * ============================================= */

type Weather = {
  SKY: number;
  PTY: number;
  LGT: number;
  RN1: number;
  WSD: number;
  VEC: number;
  T1H: number;
  REH: number;
  // 기상특보 (권한 승인 후 연결. 없으면 뱃지에 표기하지 않는다)
  warning?: { title: string; level: "경보" | "주의보" } | null;
};

/** 6종: 태양 / 구름에 가려진 태양 / 구름 / 천둥뇌우 / 바람 / 눈 */
type Kind = "sun" | "sunCloud" | "cloud" | "thunder" | "wind" | "snow";

/** 지금 파주 하늘의 해·달 */
type Sky = {
  /** 1=낮, 0=밤. 시민박명(-6°)까지 부드럽게 넘어간다 */
  dayness: number;
  night: boolean;
  /** 달이 지평선 위에 있는가. 없는 달을 그리면 실제 하늘과 어긋난다 */
  moonUp: boolean;
  phase: Phase;
  /** 화면상 밝은 쪽 기울기(deg). 밝은 면은 언제나 해를 향한다 */
  tilt: number;
  nextSet: number | null;
  nextRise: number | null;
};

function readSky(now: Date): Sky {
  const jd = julianDay(now);
  const dayness = Math.max(0, Math.min(1, (sunPos(jd).alt + 6) / 6));
  const ev = events(jd, moonPos);
  return {
    dayness,
    night: dayness < 1,
    moonUp: moonPos(jd).alt > 0,
    phase: moonPhase(jd),
    tilt: limbAngle(jd) - 90,
    nextSet: ev.find((e) => e.type === "set")?.jd ?? null,
    nextRise: ev.find((e) => e.type === "rise")?.jd ?? null,
  };
}

const BADGE_W = 210; // 컬럼 폭의 기준. 상태에 따라 흔들리면 안 되므로 고정
const COLUMN_BOTTOM = 0.78; // 컬럼이 끝나는 지점(히어로 높이 대비). 뱃지 위치가 바뀌어도 여기서 끝난다
const CLOUD_W = 0.62; // 컬럼 폭 대비 구름 크기. 작을수록 비가 떨어질 높이가 늘어난다

/** 실황값 → 6종 판정. 낙뢰 > 강수 > 강풍 > 하늘상태 순 */
function kindOf(w: Weather): Kind {
  if (w.LGT > 0 && w.PTY > 0) return "thunder";
  if (w.PTY === 3 || w.PTY === 7) return "snow";
  if (w.PTY > 0) return w.RN1 >= 12 ? "thunder" : "cloud";
  if (w.WSD >= 7) return "wind";
  if (w.SKY <= 1) return "sun";
  if (w.SKY <= 3) return "sunCloud";
  return "cloud";
}

function labelOf(w: Weather, k: Kind) {
  if (k === "thunder") return w.LGT > 0 ? "천둥 · 뇌우" : "비";
  if (k === "snow") return "눈";
  if (k === "wind") return "강풍";
  if (w.PTY > 0) return "비";
  if (k === "sun") return "맑음";
  if (k === "sunCloud") return "구름 조금";
  return "흐림";
}

function iconOf(w: Weather, k: Kind, sky: Sky | null) {
  if (k === "thunder") return w.LGT > 0 ? "⛈️" : "🌧️";
  if (k === "snow") return "🌨️";
  if (k === "wind") return "💨";
  if (w.PTY > 0) return "🌧️";
  // 밤에 하늘이 트였으면 그날 달. 달이 졌으면 별.
  // 여기서 아래 낮 분기로 떨어지면 한밤중에 ☀️가 뜬다.
  if (sky?.night && (k === "sun" || k === "sunCloud"))
    return sky.moonUp ? phaseEmoji(sky.phase.k, sky.phase.waxing) : k === "sun" ? "✨" : "☁️";
  if (k === "sun") return "☀️";
  if (k === "sunCloud") return "⛅";
  return "☁️";
}

const dirName = (d: number) =>
  ["북", "북동", "동", "남동", "남", "남서", "서", "북서"][Math.round(d / 45) % 8] + "풍";

const SHOW_MS = 30_000; // 첫인상만 주고 사라진다. 계속 떠 있으면 히어로 사진을 가린다
const FADE_MS = 1_200;

/** glow(광공해)는 밤에만 있다 */
type Pal = { top: string; bot: string; shade: string; rim: string; glow?: string };

export function WeatherBadge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wx, setWx] = useState<Weather | null>(null);
  const [sky, setSky] = useState<Sky | null>(null);
  const [hidden, setHidden] = useState(false);
  // 페이드가 끝나면 캔버스를 멈춰야 한다 — 안 보이는 걸 계속 그리면 배터리만 먹는다
  const hiddenAtRef = useRef<number>(0);

  // 뱃지는 30초만 떠 있으므로 마운트 때 한 번 계산하면 된다.
  // 클라이언트에서만 — 서버 시각으로 계산하면 하이드레이션이 어긋난다.
  useEffect(() => {
    setSky(readSky(new Date()));
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        // 날씨는 부가 연출이라 실패하면 조용히 아무것도 띄우지 않는다
        if (alive && d && typeof d.SKY === "number") setWx(d as Weather);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // 날씨가 뜬 시점부터 30초 뒤 사라진다
  useEffect(() => {
    if (!wx) return;
    const t = setTimeout(() => {
      hiddenAtRef.current = performance.now();
      setHidden(true);
    }, SHOW_MS);
    return () => clearTimeout(t);
  }, [wx]);

  useEffect(() => {
    if (!wx || !sky) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const K = kindOf(wx);
    const night = sky.night;
    // 하늘이 트인 낮에는 해, 밤에는 달. 달이 졌으면 아무것도 안 그린다.
    const showSun = (K === "sun" || K === "sunCloud") && sky.dayness > 0.01;
    const showMoon = (K === "sun" || K === "sunCloud") && night && sky.moonUp;
    const showCloud = K !== "sun";
    const gale = K === "wind";
    const bolts = K === "thunder" && wx.LGT > 0;
    const raining = wx.PTY === 1 || wx.PTY === 2 || wx.PTY === 5 || wx.PTY === 6;
    const snowing = wx.PTY === 3 || wx.PTY === 7;

    let W = 0;
    let H = 0;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    let baseY = 0;

    const dirX = Math.sin(((wx.VEC + 180) * Math.PI) / 180);
    const windNow = () => wx.WSD * (1 + 0.25 * Math.sin(t * 0.8)) * dirX;

    /* ---- 팔레트: 흰구름 → 먹구름. 밤은 달빛+광공해로 따로 짠다 ---- */
    // 달이 졌으면 구름을 비출 달빛도 없다. 없는 달을 안 그리기로 했으면 달빛도 빼야 앞뒤가 맞는다.
    const moonLight = night && sky.moonUp ? sky.phase.k : 0;
    const palette = (): Pal => {
      const wet = wx.PTY > 0;
      if (night) {
        const mix = (a: number[], b: number[], t: number) =>
          a.map((v, i) => Math.round(v + (b[i] - v) * t));
        const rgb = (a: number[]) => `rgb(${a[0]},${a[1]},${a[2]})`;
        const heavy = wet && wx.RN1 >= 12;
        // 달이 없어도 구름은 검은 덩어리가 아니다 — 파주 구름 배는 서울 불빛을 받아 뜬다
        const dim = heavy
          ? [64, 71, 90]
          : wet
            ? [70, 78, 98]
            : wx.SKY <= 3
              ? [88, 99, 126]
              : [78, 88, 112];
        return {
          top: rgb(mix(dim, [175, 190, 218], moonLight * 0.62)), // 달빛 받은 윗면
          bot: rgb(mix(dim, [20, 24, 34], 0.7)),
          // 로브 3개+바닥에 겹쳐 칠해진다. 낮 값(.24~.34)을 쓰면 검게 눌어붙는다
          shade: "rgba(10,14,24,.18)",
          // 밤 구름의 형태는 림라이트가 만든다. 달이 없어도 하늘빛만큼은 남긴다
          rim: `rgba(198,216,255,${0.22 + moonLight * 0.38})`,
          glow: `rgba(232,158,84,${heavy ? 0.12 : 0.2})`, // 광공해가 구름 배를 데운다
        };
      }
      if (wx.SKY <= 1)
        return {
          top: "#ffffff",
          bot: "#d3dceb",
          shade: "rgba(120,140,170,.17)",
          rim: "rgba(255,255,255,.95)",
        };
      if (wx.SKY <= 3 && !wet)
        return {
          top: "#f4f7fc",
          bot: "#bcc7d8",
          shade: "rgba(96,116,148,.19)",
          rim: "rgba(255,255,255,.9)",
        };
      if (!wet)
        return {
          top: "#c3cbd8",
          bot: "#8b95a6",
          shade: "rgba(58,70,90,.24)",
          rim: "rgba(238,243,250,.75)",
        };
      return wx.RN1 >= 12
        ? {
            top: "#8b95a6",
            bot: "#4e5766",
            shade: "rgba(24,30,42,.28)",
            rim: "rgba(206,216,230,.6)",
          }
        : {
            top: "#a7b1c1",
            bot: "#68727f",
            shade: "rgba(34,42,56,.25)",
            rim: "rgba(222,230,240,.65)",
          };
    };

    /* ---- 적운 실루엣 (200x120 기준) ---- */
    const cloudPath = () => {
      c.beginPath();
      c.moveTo(46, 100);
      c.bezierCurveTo(22, 100, 6, 86, 9, 65);
      c.bezierCurveTo(12, 47, 29, 35, 46, 39);
      c.bezierCurveTo(49, 17, 68, 3, 90, 6);
      c.bezierCurveTo(110, 9, 126, 24, 129, 43);
      c.bezierCurveTo(135, 37, 144, 34, 152, 36);
      c.bezierCurveTo(174, 41, 186, 61, 179, 81);
      c.bezierCurveTo(174, 94, 161, 100, 148, 100);
      c.closePath();
    };
    const LOBES = [
      { x: 40, y: 70, r: 30 },
      { x: 88, y: 46, r: 38 },
      { x: 150, y: 70, r: 30 },
    ];

    const drawCloud = (S: number, ox: number, oy: number, flash: number) => {
      const pal = palette();
      c.save();
      c.translate(ox, oy);
      c.scale(S, S);
      const br = 1 + Math.sin(t * 0.5) * 0.012; // 느린 호흡
      const sway = gale ? Math.sin(t * 1.6) * 2.2 : 0;
      c.translate(100 + sway, 60);
      c.scale(br, br);
      c.translate(-100, -60);

      cloudPath();
      c.save();
      c.clip();
      const g = c.createLinearGradient(0, 6, 0, 100); // 윗면은 빛, 아랫면은 그늘
      g.addColorStop(0, pal.top);
      g.addColorStop(1, pal.bot);
      c.fillStyle = g;
      c.fillRect(0, 0, 200, 120);
      for (const L of LOBES) {
        // 뭉치가 겹치는 안쪽 그림자
        const rg = c.createRadialGradient(L.x, L.y - L.r * 0.35, L.r * 0.2, L.x, L.y, L.r * 1.5);
        rg.addColorStop(0, "rgba(0,0,0,0)");
        rg.addColorStop(1, pal.shade);
        c.fillStyle = rg;
        c.fillRect(0, 0, 200, 120);
      }
      const bg = c.createLinearGradient(0, 74, 0, 102); // 적운은 밑이 평평하고 어둡다
      bg.addColorStop(0, "rgba(0,0,0,0)");
      bg.addColorStop(1, pal.shade);
      c.fillStyle = bg;
      c.fillRect(0, 0, 200, 120);
      if (pal.glow) {
        // 광공해: 서울·파주 시가지 불빛이 구름 배에 반사돼 주황빛으로 뜬다.
        // 달 없는 밤에도 구름이 검은 덩어리로 안 보이는 진짜 이유가 이것이다.
        const ug = c.createLinearGradient(0, 104, 0, 72);
        ug.addColorStop(0, pal.glow);
        ug.addColorStop(1, "rgba(232,158,84,0)");
        c.fillStyle = ug;
        c.fillRect(0, 0, 200, 120);
      }
      for (const L of LOBES) {
        const hg = c.createRadialGradient(
          L.x - 4,
          L.y - L.r * 0.75,
          1,
          L.x - 4,
          L.y - L.r * 0.75,
          L.r * 0.9
        );
        // 뭉치 하이라이트도 광량에 비례한다 — 밤에 낮 값을 쓰면 구름이 종이처럼 뜬다
        hg.addColorStop(0, `rgba(255,255,255,${night ? 0.06 + moonLight * 0.24 : 0.45})`);
        hg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = hg;
        c.fillRect(0, 0, 200, 120);
      }
      if (flash > 0.01) {
        // 낙뢰 시 구름이 안쪽부터 밝아진다
        const fg = c.createRadialGradient(95, 86, 2, 95, 86, 90);
        fg.addColorStop(0, `rgba(226,238,255,${0.85 * flash})`);
        fg.addColorStop(1, "rgba(190,214,255,0)");
        c.fillStyle = fg;
        c.fillRect(0, 0, 200, 120);
      }
      c.restore();
      // 림라이트: 실루엣을 아래로 밀어 stroke → 클립하면 윗 가장자리만 남는다
      c.save();
      cloudPath();
      c.clip();
      c.filter = "blur(2px)";
      c.globalAlpha = 0.75;
      c.strokeStyle = pal.rim;
      c.lineWidth = 3.5;
      c.translate(0, 3);
      cloudPath();
      c.stroke();
      c.restore();
      c.restore();
      return oy + 100 * S;
    };

    const drawSun = (x: number, y: number, r: number) => {
      c.save();
      const g = c.createRadialGradient(x, y, 2, x, y, r * 1.9);
      g.addColorStop(0, "rgba(255,214,120,1)");
      g.addColorStop(0.42, "rgba(255,196,84,.95)");
      g.addColorStop(1, "rgba(255,190,80,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r * 1.9, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#ffd36b";
      c.beginPath();
      c.arc(x, y, r * 0.62, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 0.5;
      c.strokeStyle = "#ffd36b";
      c.lineWidth = 1.6;
      c.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = t * 0.25 + (i * Math.PI) / 4;
        c.beginPath();
        c.moveTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95);
        c.lineTo(x + Math.cos(a) * r * 1.28, y + Math.sin(a) * r * 1.28);
        c.stroke();
      }
      c.restore();
    };

    /* ---- 달 ----
     * 명암경계선(터미네이터)은 반원이 아니라 반타원이다. x반지름 = r·|2k-1|.
     * k>0.5면 어두운 쪽으로, k<0.5면 밝은 쪽으로 볼록해진다.
     * 이 한 줄로 삭·초승·상현·망·하현·그믐이 전부 자동으로 맞는다.
     */
    const MARIA = [
      // 달의 바다. 있으면 원이 아니라 달로 읽힌다
      { x: -0.3, y: -0.34, r: 0.3, a: 0.16 },
      { x: 0.16, y: -0.42, r: 0.22, a: 0.13 },
      { x: 0.3, y: -0.06, r: 0.3, a: 0.11 },
      { x: -0.42, y: 0.1, r: 0.2, a: 0.1 },
      { x: -0.06, y: -0.1, r: 0.26, a: 0.09 },
    ];

    const drawMoon = (cx: number, cy: number, r: number) => {
      const { k, waxing } = sky.phase;
      const s = 2 * k - 1;
      c.save();
      c.translate(cx, cy);

      // 달무리
      const hr = r * (2.2 + k * 1.4);
      const halo = c.createRadialGradient(0, 0, r * 0.7, 0, 0, hr);
      halo.addColorStop(0, `rgba(214,230,255,${0.16 + k * 0.2})`);
      halo.addColorStop(0.5, `rgba(190,214,255,${0.05 + k * 0.07})`);
      halo.addColorStop(1, "rgba(180,205,255,0)");
      c.fillStyle = halo;
      c.beginPath();
      c.arc(0, 0, hr, 0, Math.PI * 2);
      c.fill();

      c.rotate(sky.tilt * (Math.PI / 180)); // 밝은 면은 해를 향한다
      if (!waxing) c.scale(-1, 1); // 기우는 달은 왼쪽이 밝다

      // 지구조 — 얇은 달일수록 어두운 면이 지구 반사광에 뜬다
      if (k < 0.45) {
        const a = ((0.45 - k) / 0.45) * 0.19;
        const eg = c.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
        eg.addColorStop(0, `rgba(150,175,215,${a})`);
        eg.addColorStop(1, `rgba(110,135,175,${a * 0.45})`);
        c.fillStyle = eg;
        c.beginPath();
        c.arc(0, 0, r * 0.985, 0, Math.PI * 2);
        c.fill();
      }

      const litPath = () => {
        c.beginPath();
        c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false); // 위 → 오른쪽 → 아래
        c.ellipse(0, 0, r * Math.abs(s), r, 0, Math.PI / 2, -Math.PI / 2, s < 0);
        c.closePath();
      };

      if (k > 0.005) {
        c.save();
        litPath();
        c.clip();
        const g = c.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.05, 0, 0, r * 1.15);
        g.addColorStop(0, "#fffdf4");
        g.addColorStop(0.55, "#f3ecd8");
        g.addColorStop(1, "#cdc3ab"); // 가장자리 어두워짐(주연감광)
        c.fillStyle = g;
        c.fillRect(-r, -r, r * 2, r * 2);
        for (const m of MARIA) {
          const mg = c.createRadialGradient(m.x * r, m.y * r, 0, m.x * r, m.y * r, m.r * r);
          mg.addColorStop(0, `rgba(122,116,104,${m.a})`);
          mg.addColorStop(1, "rgba(122,116,104,0)");
          c.fillStyle = mg;
          c.fillRect(-r, -r, r * 2, r * 2);
        }
        c.restore();

        // 실제 명암경계는 칼처럼 끊기지 않는다
        c.save();
        litPath();
        c.clip();
        c.filter = "blur(1.6px)";
        c.globalAlpha = 0.5;
        c.strokeStyle = "rgba(60,66,80,.85)";
        c.lineWidth = 2.4;
        c.beginPath();
        c.ellipse(0, 0, r * Math.abs(s), r, 0, Math.PI / 2, -Math.PI / 2, s < 0);
        c.stroke();
        c.restore();
      }
      c.restore();
    };

    /* ---- 낙뢰 ---- */
    let bolt: { main: { x: number; y: number }[]; br: { x: number; y: number }[] } | null = null;
    let flash = 0;
    let nextBolt = 1.2;
    const makeBolt = () => {
      const main = [];
      let x = W * 0.36 + Math.random() * W * 0.28;
      let y = baseY;
      const seg = 7 + Math.floor(Math.random() * 3);
      const step = (H * 0.82 - baseY) / seg;
      for (let i = 0; i <= seg; i++) {
        main.push({ x, y });
        x += (Math.random() - 0.5) * W * 0.24;
        y += step * (0.75 + Math.random() * 0.5);
      }
      const bi = 2 + Math.floor(Math.random() * 3);
      const br = [main[bi]];
      let bx = main[bi].x;
      let by = main[bi].y;
      for (let i = 0; i < 3; i++) {
        bx += (Math.random() - 0.5) * W * 0.3;
        by += step * 0.7;
        br.push({ x: bx, y: by });
      }
      return { main, br };
    };
    const strokeBolt = (
      pts: { x: number; y: number }[],
      w: number,
      color: string,
      alpha: number
    ) => {
      c.globalAlpha = alpha;
      c.strokeStyle = color;
      c.lineWidth = w;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.beginPath();
      c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
      c.stroke();
    };
    const drawBolt = () => {
      if (!bolt || flash <= 0.01) return;
      const a = Math.min(1, flash * 1.6);
      // 글로우 → 심지 2겹
      strokeBolt(bolt.main, 9, "rgba(150,190,255,.30)", a * 0.7);
      strokeBolt(bolt.br, 5, "rgba(150,190,255,.25)", a * 0.6);
      strokeBolt(bolt.main, 3.2, "rgba(200,225,255,.95)", a);
      strokeBolt(bolt.br, 1.8, "rgba(200,225,255,.8)", a * 0.85);
      strokeBolt(bolt.main, 1.3, "rgba(255,255,255,1)", a);
      c.globalAlpha = 1;
    };

    /* ---- 바람결 ---- */
    type Gust = {
      x: number;
      y: number;
      dy: number;
      len: number;
      w: number;
      a: number;
      sp: number;
      ph: number;
      hook: boolean;
    };
    let gusts: Gust[] = [];
    const ROWS = [
      { dy: 18, len: 118, w: 3.4, a: 0.92, sp: 1.0, hook: true },
      { dy: 46, len: 84, w: 2.6, a: 0.72, sp: 1.3, hook: false },
      { dy: 74, len: 104, w: 3.0, a: 0.85, sp: 0.85, hook: true },
      { dy: 104, len: 76, w: 2.4, a: 0.66, sp: 1.15, hook: false },
      { dy: 134, len: 110, w: 3.2, a: 0.8, sp: 0.95, hook: true },
      { dy: 164, len: 88, w: 2.6, a: 0.6, sp: 1.35, hook: false },
    ];
    const buildGusts = () => {
      // 흩뿌린 가는 선은 사진 위에서 긁힌 자국처럼 보인다 → 굵은 스우시를 의도적으로 배치
      gusts = gale
        ? ROWS.map((r, i) => ({
            ...r,
            y: baseY + r.dy,
            x: -100 + (i % 3) * ((W + 200) / 3) + (i >= 3 ? (W + 200) / 6 : 0),
            ph: i * 1.4,
          }))
        : [];
    };
    const drawGusts = (dt: number) => {
      const d = dirX > 0 ? 1 : -1;
      for (const g of gusts) {
        g.x += windNow() * 8 * g.sp * dt;
        g.ph += dt * 2;
        g.y += Math.cos(g.ph) * 5 * dt;
        if (d > 0 ? g.x - g.len > W + 30 : g.x + g.len < -30) {
          g.x = d > 0 ? -g.len - 20 : W + g.len + 20;
          g.y = baseY + g.dy; // 정해둔 행을 유지 (랜덤으로 덮으면 배치가 깨진다)
        }
        const tail = g.x - g.len * d;
        const wob = Math.sin(g.ph) * 4;
        c.save();
        c.shadowColor = "rgba(30,45,70,.45)"; // 밝은 배경에서도 읽히도록
        c.shadowBlur = 5;
        const grd = c.createLinearGradient(g.x, 0, tail, 0);
        grd.addColorStop(0, `rgba(255,255,255,${g.a})`);
        grd.addColorStop(0.75, `rgba(255,255,255,${g.a * 0.35})`);
        grd.addColorStop(1, "rgba(255,255,255,0)");
        c.strokeStyle = grd;
        c.lineWidth = g.w;
        c.lineCap = "round";
        c.globalAlpha = 1;
        c.beginPath();
        c.moveTo(tail, g.y + wob * 0.4);
        c.bezierCurveTo(
          tail + g.len * d * 0.45,
          g.y - wob,
          g.x - g.len * d * 0.25,
          g.y + wob,
          g.x,
          g.y
        );
        if (g.hook) c.quadraticCurveTo(g.x + 11 * d, g.y - 2, g.x + 5 * d, g.y - 9);
        c.stroke();
        c.restore();
      }
    };

    /* ---- 비/눈 ---- */
    type Part = { x: number; y: number; v: number; ph: number; r: number };
    let parts: Part[] = [];
    const spawn = (init: boolean): Part => ({
      x: W * 0.16 + Math.random() * W * 0.68,
      y: init ? baseY + Math.random() * (H - baseY) : baseY - 2,
      v: snowing ? 26 : 130 + Math.random() * 70,
      ph: Math.random() * 7,
      r: snowing ? 1 + Math.random() * 1.6 : 0,
    });
    const buildParts = () => {
      const n = raining ? (wx.RN1 >= 12 ? 70 : 42) : snowing ? 52 : 0;
      parts = Array.from({ length: n }, () => spawn(true));
    };

    let mask: CanvasGradient | null = null;
    const resize = () => {
      const section = wrapRef.current?.closest("section");
      const heroH = section?.clientHeight ?? 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = BADGE_W;
      // 뱃지는 상단 고정배너를 피해 뷰포트마다 다른 높이에서 시작한다.
      // 컬럼 길이를 고정하면 뱃지가 내려간 만큼 같이 밀려 내려가므로,
      // 히어로의 COLUMN_BOTTOM 지점에서 끝나도록 역산한다.
      const canvasTop =
        section && canvas
          ? canvas.getBoundingClientRect().top - section.getBoundingClientRect().top
          : 0;
      H = Math.max(180, Math.round(heroH * COLUMN_BOTTOM - canvasTop));
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      mask = c.createLinearGradient(0, 0, 0, H);
      mask.addColorStop(0, "rgba(0,0,0,1)");
      mask.addColorStop(0.55, "rgba(0,0,0,.9)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      baseY = 2 + 100 * ((W * CLOUD_W) / 200);
      buildGusts();
      buildParts();
    };
    resize();

    const frame = (now: number) => {
      // 페이드아웃이 끝났으면 rAF를 재요청하지 않는다 (안 보이는 캔버스를 계속 그릴 이유가 없다)
      if (hiddenAtRef.current && now - hiddenAtRef.current > FADE_MS) {
        c.clearRect(0, 0, W, H);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      c.clearRect(0, 0, W, H);

      const S = (W * CLOUD_W) / 200;
      const ox = (W - 200 * S) / 2;

      if (bolts) {
        nextBolt -= dt;
        if (nextBolt <= 0) {
          bolt = makeBolt();
          flash = 1;
          nextBolt = 2.5 + Math.random() * 3.5;
        }
        flash = Math.max(0, flash - dt * 3.4);
        // 잔섬광 — 실제 낙뢰는 한 번에 끝나지 않는다
        if (flash > 0.3 && flash < 0.42 && Math.random() < 0.35) flash = Math.min(1, flash + 0.45);
      }

      // 해와 달은 같은 자리를 쓴다. 박명에는 겹쳐서 교대한다.
      const sunR = W * 0.125;
      const lx = showCloud ? ox + 200 * S * 0.82 : W / 2;
      const ly = showCloud ? 6 + sunR : 10 + sunR * 1.4;
      if (showSun) {
        c.save();
        c.globalAlpha = sky.dayness;
        drawSun(lx, ly, sunR);
        c.restore();
      }
      if (showMoon) {
        c.save();
        c.globalAlpha = 1 - sky.dayness;
        drawMoon(lx, ly, sunR * 0.9);
        c.restore();
      }
      if (showCloud) baseY = drawCloud(S, ox, 2, flash);
      if (gale) drawGusts(dt);
      drawBolt();

      const wind = windNow();
      for (const p of parts) {
        p.ph += dt * 3;
        p.y += p.v * dt;
        p.x += wind * 2.2 * dt + (snowing ? Math.cos(p.ph) * 10 * dt : 0);
        if (p.y > H + 4 || p.x < -10 || p.x > W + 10) Object.assign(p, spawn(false));
        const fade = Math.min(1, (p.y - baseY) / 14);
        c.save();
        c.shadowColor = "rgba(28,42,66,.5)"; // 연한 선은 밝은 사진에 묻힌다
        c.shadowBlur = 4;
        if (snowing) {
          c.globalAlpha = 0.95 * fade;
          c.beginPath();
          c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          c.fillStyle = "#fff";
          c.fill();
        } else {
          const k = 0.055; // 길이 = 속도 × 노출시간 → 바람 셀수록 길고 눕는다
          c.globalAlpha = 0.9 * fade;
          c.strokeStyle = "rgba(214,236,255,1)";
          c.lineWidth = 1.9;
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(p.x - wind * 2.2 * k, p.y - p.v * k);
          c.stroke();
        }
        c.restore();
      }
      c.globalAlpha = 1;

      if (flash > 0.01) {
        c.fillStyle = `rgba(200,222,255,${0.13 * flash})`;
        c.fillRect(0, 0, W, H);
      }

      // 아래로 갈수록 사라져 히어로에 녹아든다
      c.globalCompositeOperation = "destination-in";
      c.fillStyle = mask!;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [wx, sky]);

  if (!wx) return null;
  const K = kindOf(wx);
  const moonInfo = sky?.night && (K === "sun" || K === "sunCloud") ? sky : null;

  return (
    <div
      ref={wrapRef}
      // 상단 고정배너(공지)가 뷰포트마다 다른 높이까지 덮는다: 모바일 184 / md 168 / lg 152px.
      // 그 아래로 내려야 뱃지가 가려지지 않는다.
      className={`absolute top-48 left-4 z-10 pointer-events-none transition-opacity ease-out lg:top-44 lg:left-8 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
      style={{ width: BADGE_W, transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={hidden}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/35 backdrop-blur-md border border-white/15">
        <span className="text-xl leading-none">{iconOf(wx, K, sky)}</span>
        <div className="leading-tight min-w-0">
          <div className="text-white text-sm font-semibold truncate">
            {labelOf(wx, K)} · {Math.round(wx.T1H)}°
          </div>
          <div className="text-white/60 text-[10px] truncate">
            파주 초리골 · 바람 {wx.WSD.toFixed(1)}m/s {dirName(wx.VEC)}
          </div>
          {/* 밤에 하늘이 트였을 때만. 달이 졌으면 언제 뜨는지 알려준다.
              월령·%는 뺐다 — 뱃지 폭(텍스트 151px)에 "차오르는 달 · 월령 10.5일 · 05:48 짐"이
              162px으로 넘쳐서 정작 중요한 지는 시각이 잘린다. 모양은 그림이 이미 보여준다. */}
          {moonInfo &&
            (moonInfo.moonUp ? (
              <div className="text-amber-200/70 text-[10px] truncate">
                {phaseName(moonInfo.phase.k, moonInfo.phase.waxing)}
                {moonInfo.nextSet && ` · ${fmtKST(moonInfo.nextSet)} 짐`}
              </div>
            ) : (
              <div className="text-white/35 text-[10px] truncate">
                달 없음{moonInfo.nextRise && ` · ${fmtKST(moonInfo.nextRise)} 뜸`}
              </div>
            ))}
          {/* 기상특보는 있을 때만 표기 */}
          {wx.warning && (
            <div
              className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                wx.warning.level === "경보"
                  ? "bg-red-500/85 text-white"
                  : "bg-amber-400/90 text-amber-950"
              }`}
            >
              {wx.warning.level === "경보" ? "🔴" : "🟡"} {wx.warning.title}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="block mt-1.5 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
