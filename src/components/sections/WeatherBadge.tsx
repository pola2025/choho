"use client";

import { useEffect, useRef, useState } from "react";

/* =============================================
 * 히어로 날씨: 뱃지 + 그 아래 컬럼
 * 기상청 실황값(SKY·PTY·LGT·RN1·WSD·VEC)을 그대로 시각으로 변환한다.
 * 전체화면이 아니라 뱃지 폭 안에서만 그리므로 부담이 작다.
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

function iconOf(w: Weather, k: Kind) {
  if (k === "thunder") return w.LGT > 0 ? "⛈️" : "🌧️";
  if (k === "snow") return "🌨️";
  if (k === "wind") return "💨";
  if (w.PTY > 0) return "🌧️";
  if (k === "sun") return "☀️";
  if (k === "sunCloud") return "⛅";
  return "☁️";
}

const dirName = (d: number) =>
  ["북", "북동", "동", "남동", "남", "남서", "서", "북서"][Math.round(d / 45) % 8] + "풍";

export function WeatherBadge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wx, setWx] = useState<Weather | null>(null);

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

  useEffect(() => {
    if (!wx) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const K = kindOf(wx);
    const showSun = K === "sun" || K === "sunCloud";
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

    /* ---- 팔레트: 흰구름 → 먹구름 ---- */
    const palette = () => {
      const wet = wx.PTY > 0;
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
      for (const L of LOBES) {
        const hg = c.createRadialGradient(
          L.x - 4,
          L.y - L.r * 0.75,
          1,
          L.x - 4,
          L.y - L.r * 0.75,
          L.r * 0.9
        );
        hg.addColorStop(0, "rgba(255,255,255,.45)");
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

      const sunR = W * 0.125;
      if (showSun)
        drawSun(
          showCloud ? ox + 200 * S * 0.82 : W / 2,
          showCloud ? 6 + sunR : 10 + sunR * 1.4,
          sunR
        );
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
  }, [wx]);

  if (!wx) return null;
  const K = kindOf(wx);

  return (
    <div
      ref={wrapRef}
      // 상단 고정배너(공지)가 뷰포트마다 다른 높이까지 덮는다: 모바일 184 / md 168 / lg 152px.
      // 그 아래로 내려야 뱃지가 가려지지 않는다.
      className="absolute top-48 left-4 z-10 lg:top-44 lg:left-8"
      style={{ width: BADGE_W }}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/35 backdrop-blur-md border border-white/15">
        <span className="text-xl leading-none">{iconOf(wx, K)}</span>
        <div className="leading-tight min-w-0">
          <div className="text-white text-sm font-semibold truncate">
            {labelOf(wx, K)} · {Math.round(wx.T1H)}°
          </div>
          <div className="text-white/60 text-[10px] truncate">
            파주 초리골 · 바람 {wx.WSD.toFixed(1)}m/s {dirName(wx.VEC)}
          </div>
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
