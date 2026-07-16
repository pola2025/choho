"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* =============================================
 * 정면 SVG (idle 상태)
 * ============================================= */

function FrontRabbitSVG({
  bodyColor,
  earInner,
  tailColor,
  noseColor,
}: {
  bodyColor: string;
  earInner: string;
  tailColor: string;
  noseColor: string;
}) {
  return (
    <svg
      viewBox="0 0 60 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm"
    >
      <path d="M18 28 Q14 10 18 4 Q22 -1 24 4 Q27 12 24 28" fill={bodyColor} />
      <path d="M19.5 26 Q16 12 19 6 Q21.5 2 23 6 Q25 14 23 26" fill={earInner} />
      <path d="M36 28 Q33 10 36 4 Q40 -1 42 4 Q45 12 42 28" fill={bodyColor} />
      <path d="M37.5 26 Q35 12 37 6 Q39.5 2 41 6 Q43 14 41 26" fill={earInner} />
      <ellipse cx="30" cy="52" rx="16" ry="14" fill={bodyColor} />
      <circle cx="30" cy="34" r="14" fill={bodyColor} />
      <circle cx="20" cy="37" r="4" fill={noseColor} opacity="0.25" />
      <circle cx="40" cy="37" r="4" fill={noseColor} opacity="0.25" />
      <ellipse cx="24" cy="32" rx="2.2" ry="2.8" fill="#2d2d2d" />
      <ellipse cx="36" cy="32" rx="2.2" ry="2.8" fill="#2d2d2d" />
      <circle cx="25" cy="31" r="0.9" fill="#fff" />
      <circle cx="37" cy="31" r="0.9" fill="#fff" />
      <ellipse cx="30" cy="37" rx="2.5" ry="1.8" fill={noseColor} />
      <path
        d="M28 39 Q30 41 32 39"
        stroke={noseColor}
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="44" cy="52" r="5" fill={tailColor} />
      <ellipse cx="22" cy="62" rx="5" ry="4" fill={bodyColor} />
      <ellipse cx="38" cy="62" rx="5" ry="4" fill={bodyColor} />
    </svg>
  );
}

function FrontAlpacaSVG() {
  return (
    <svg
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm"
    >
      <circle cx="24" cy="10" r="7" fill="#f5e6d0" />
      <circle cx="32" cy="7" r="7" fill="#f0dcc0" />
      <circle cx="40" cy="10" r="7" fill="#f5e6d0" />
      <circle cx="28" cy="14" r="6" fill="#ecdcc8" />
      <circle cx="36" cy="13" r="6" fill="#f0dcc0" />
      <ellipse cx="18" cy="14" rx="4" ry="7" fill="#f5e6d0" transform="rotate(-15 18 14)" />
      <ellipse cx="18.5" cy="14" rx="2.5" ry="5" fill="#f0c8b8" transform="rotate(-15 18.5 14)" />
      <ellipse cx="46" cy="14" rx="4" ry="7" fill="#f5e6d0" transform="rotate(15 46 14)" />
      <ellipse cx="45.5" cy="14" rx="2.5" ry="5" fill="#f0c8b8" transform="rotate(15 45.5 14)" />
      <ellipse cx="32" cy="24" rx="11" ry="10" fill="#f5e6d0" />
      <circle cx="23" cy="27" r="3.5" fill="#f0c0b0" opacity="0.3" />
      <circle cx="41" cy="27" r="3.5" fill="#f0c0b0" opacity="0.3" />
      <ellipse cx="27" cy="23" rx="2" ry="2.5" fill="#2d2d2d" />
      <ellipse cx="37" cy="23" rx="2" ry="2.5" fill="#2d2d2d" />
      <circle cx="28" cy="22" r="0.8" fill="#fff" />
      <circle cx="38" cy="22" r="0.8" fill="#fff" />
      <ellipse cx="32" cy="28" rx="2" ry="1.5" fill="#c49878" />
      <path
        d="M30 30 Q32 32 34 30"
        stroke="#c49878"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="26" y="32" width="12" height="16" rx="6" fill="#f5e6d0" />
      <ellipse cx="32" cy="56" rx="18" ry="14" fill="#ecdcc8" />
      <circle cx="26" cy="50" r="4" fill="#f0dcc0" opacity="0.5" />
      <circle cx="38" cy="52" r="4" fill="#f0dcc0" opacity="0.5" />
      <rect x="18" y="66" width="7" height="10" rx="3.5" fill="#d4c0a8" />
      <rect x="28" y="66" width="7" height="10" rx="3.5" fill="#d4c0a8" />
      <rect x="39" y="66" width="7" height="10" rx="3.5" fill="#d4c0a8" />
    </svg>
  );
}

function FrontGooseSVG() {
  return (
    <svg
      viewBox="0 0 64 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm"
    >
      <ellipse cx="38" cy="44" rx="18" ry="14" fill="#f8f8f2" />
      <path d="M30 36 Q42 28 52 34 Q48 40 36 42 Z" fill="#eaeae0" />
      <path d="M34 38 Q44 32 50 36 Q46 40 38 41 Z" fill="#e0e0d6" />
      <path
        d="M54 38 Q60 32 58 26"
        stroke="#e0e0d6"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 40 Q62 34 60 30"
        stroke="#eaeae0"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 40 Q14 28 16 14"
        stroke="#f8f8f2"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="12" r="7" fill="#f8f8f2" />
      <circle cx="12" cy="14" r="2.5" fill="#f0c8b0" opacity="0.3" />
      <ellipse cx="13" cy="11" rx="1.8" ry="2.2" fill="#2d2d2d" />
      <circle cx="13.6" cy="10.4" r="0.7" fill="#fff" />
      <path d="M9 14 Q5 15.5 4 15 Q5 17 9 16.5 Z" fill="#e8a030" />
      <line
        x1="32"
        y1="56"
        x2="30"
        y2="64"
        stroke="#e8a030"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="56"
        x2="40"
        y2="64"
        stroke="#e8a030"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M26 64 Q30 66 34 64"
        stroke="#e8a030"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 64 Q40 66 44 64"
        stroke="#e8a030"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* =============================================
 * 옆모습 SVG (이동 상태) - dangerouslySetInnerHTML 용
 * ============================================= */

function sideRabbitHTML(
  bodyColor: string,
  earInner: string,
  bellyColor: string,
  noseColor: string
) {
  return `<svg viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <circle cx="12" cy="28" r="4" fill="${bellyColor}"/>
    <ellipse cx="32" cy="28" rx="20" ry="14" fill="${bodyColor}"/>
    <ellipse cx="34" cy="33" rx="14" ry="8" fill="${bellyColor}" opacity="0.4"/>
    <g class="leg-back-inner" style="transform-origin:22px 36px"><path d="M22 36 Q18 44 22 48 Q26 48 26 44 Q24 40 22 36Z" fill="${bodyColor}" opacity="0.7"/></g>
    <g class="leg-back" style="transform-origin:24px 34px"><path d="M24 34 Q18 44 22 48 Q28 49 28 44 Q26 38 24 34Z" fill="${bodyColor}"/><ellipse cx="25" cy="48" rx="4" ry="2" fill="${bodyColor}"/></g>
    <g class="leg-front-inner" style="transform-origin:44px 34px"><rect x="42" y="34" width="4" height="12" rx="2" fill="${bodyColor}" opacity="0.7"/></g>
    <g class="leg-front" style="transform-origin:46px 34px"><rect x="44" y="34" width="5" height="13" rx="2.5" fill="${bodyColor}"/><ellipse cx="47" cy="47" rx="3" ry="1.5" fill="${bodyColor}"/></g>
    <ellipse cx="54" cy="20" rx="10" ry="9" fill="${bodyColor}"/>
    <ellipse cx="46" cy="8" rx="3.5" ry="10" fill="${bodyColor}" transform="rotate(-20 46 8)"/>
    <ellipse cx="46" cy="8" rx="2" ry="8" fill="${earInner}" transform="rotate(-20 46 8)"/>
    <ellipse cx="50" cy="6" rx="3.5" ry="11" fill="${bodyColor}" transform="rotate(-10 50 6)"/>
    <ellipse cx="50" cy="6" rx="2" ry="9" fill="${earInner}" transform="rotate(-10 50 6)"/>
    <circle cx="60" cy="22" r="3" fill="${noseColor}" opacity="0.2"/>
    <ellipse cx="58" cy="18" rx="2" ry="2.5" fill="#2d2d2d"/>
    <circle cx="58.8" cy="17.2" r="0.8" fill="white"/>
    <ellipse cx="63" cy="21" rx="1.8" ry="1.3" fill="${noseColor}"/>
  </svg>`;
}

function sideAlpacaHTML() {
  return `<svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <ellipse cx="14" cy="42" rx="5" ry="4" fill="#ecdcc8"/>
    <ellipse cx="40" cy="44" rx="26" ry="16" fill="#ecdcc8"/>
    <circle cx="30" cy="38" r="5" fill="#f0dcc0" opacity="0.5"/>
    <circle cx="42" cy="36" r="5" fill="#f5e6d0" opacity="0.5"/>
    <g class="leg-back-left" style="transform-origin:22px 56px"><rect x="19" y="56" width="6" height="18" rx="3" fill="#d4c0a8" opacity="0.7"/></g>
    <g class="leg-back-right" style="transform-origin:28px 56px"><rect x="25" y="56" width="7" height="20" rx="3.5" fill="#d4c0a8"/></g>
    <g class="leg-front-left" style="transform-origin:50px 56px"><rect x="47" y="56" width="6" height="18" rx="3" fill="#d4c0a8" opacity="0.7"/></g>
    <g class="leg-front-right" style="transform-origin:56px 56px"><rect x="53" y="56" width="7" height="20" rx="3.5" fill="#d4c0a8"/></g>
    <path d="M58 40 Q62 28 60 12" stroke="#f5e6d0" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M58 40 Q62 28 60 12" stroke="#ecdcc8" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="58" cy="6" r="5" fill="#f5e6d0"/><circle cx="62" cy="4" r="5" fill="#f0dcc0"/><circle cx="60" cy="9" r="4" fill="#ecdcc8"/>
    <ellipse cx="54" cy="4" rx="2.5" ry="6" fill="#f5e6d0" transform="rotate(-20 54 4)"/>
    <ellipse cx="54" cy="4" rx="1.5" ry="4.5" fill="#f0c8b8" transform="rotate(-20 54 4)"/>
    <ellipse cx="62" cy="12" rx="7" ry="6" fill="#f5e6d0"/>
    <circle cx="67" cy="14" r="2.5" fill="#f0c0b0" opacity="0.25"/>
    <ellipse cx="65" cy="11" rx="1.5" ry="2" fill="#2d2d2d"/><circle cx="65.6" cy="10.4" r="0.6" fill="white"/>
    <ellipse cx="68" cy="14" rx="1.5" ry="1" fill="#c49878"/>
  </svg>`;
}

function sideGooseHTML() {
  return `<svg viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <path d="M8 30 Q4 26 2 20" stroke="#eaeae0" stroke-width="3" stroke-linecap="round" fill="none"/>
    <ellipse cx="28" cy="32" rx="20" ry="13" fill="#f8f8f2"/>
    <path d="M16 26 Q28 20 36 24 Q32 32 18 34Z" fill="#eaeae0"/>
    <path d="M20 28 Q30 22 34 26 Q30 32 22 33Z" fill="#e0e0d6"/>
    <g class="leg-left" style="transform-origin:24px 42px"><line x1="24" y1="42" x2="22" y2="52" stroke="#e8a030" stroke-width="2.5" stroke-linecap="round"/><path d="M18 52 Q22 54 26 52" stroke="#e8a030" stroke-width="2" stroke-linecap="round" fill="none"/></g>
    <g class="leg-right" style="transform-origin:32px 42px"><line x1="32" y1="42" x2="30" y2="52" stroke="#e8a030" stroke-width="2.5" stroke-linecap="round"/><path d="M26 52 Q30 54 34 52" stroke="#e8a030" stroke-width="2" stroke-linecap="round" fill="none"/></g>
    <path d="M42 30 Q50 22 52 10" stroke="#f8f8f2" stroke-width="7" stroke-linecap="round" fill="none"/>
    <g class="head"><circle cx="53" cy="8" r="6" fill="#f8f8f2"/><ellipse cx="56" cy="7" rx="1.5" ry="1.8" fill="#2d2d2d"/><circle cx="56.4" cy="6.4" r="0.6" fill="white"/><path d="M58 9 Q63 10 64 9.5 Q63 12 58 11Z" fill="#e8a030"/></g>
  </svg>`;
}

/* =============================================
 * 타입 & 레지스트리
 * ============================================= */

type AnimalType = "black-rabbit" | "gray-rabbit" | "white-rabbit" | "alpaca" | "goose";

const animalRegistry: Record<
  AnimalType,
  { label: string; size: number; kind: "rabbit" | "alpaca" | "goose" }
> = {
  "black-rabbit": { label: "검정 토끼", size: 56, kind: "rabbit" },
  "gray-rabbit": { label: "회색 토끼", size: 50, kind: "rabbit" },
  "white-rabbit": { label: "흰 토끼", size: 54, kind: "rabbit" },
  alpaca: { label: "알파카", size: 68, kind: "alpaca" },
  goose: { label: "거위", size: 62, kind: "goose" },
};

const rabbitColors: Record<string, { body: string; ear: string; belly: string; nose: string }> = {
  "black-rabbit": { body: "#2a2a2a", ear: "#4a4a4a", belly: "#3a3a3a", nose: "#888" },
  "gray-rabbit": { body: "#9e9e9e", ear: "#c8b0b0", belly: "#b0b0b0", nose: "#e8a0a0" },
  "white-rabbit": { body: "#f5f0eb", ear: "#f0d0cc", belly: "#fff", nose: "#e8a0a0" },
};

function FrontIcon({ type }: { type: AnimalType }) {
  const info = animalRegistry[type];
  if (info.kind === "rabbit") {
    const c = rabbitColors[type];
    return (
      <FrontRabbitSVG bodyColor={c.body} earInner={c.ear} tailColor={c.belly} noseColor={c.nose} />
    );
  }
  if (info.kind === "alpaca") return <FrontAlpacaSVG />;
  return <FrontGooseSVG />;
}

function getSideHTML(type: AnimalType) {
  const info = animalRegistry[type];
  if (info.kind === "rabbit") {
    const c = rabbitColors[type];
    return sideRabbitHTML(c.body, c.ear, c.belly, c.nose);
  }
  if (info.kind === "alpaca") return sideAlpacaHTML();
  return sideGooseHTML();
}

/* =============================================
 * 동물 컴포넌트 (정면idle ↔ 옆모습이동)
 * ============================================= */

function Animal({ type, baseX }: { type: AnimalType; baseX: number }) {
  const info = animalRegistry[type];
  const containerRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    facing: 1 as 1 | -1,
    phase: "idle" as "idle" | "moving",
    timer: 2000 + Math.random() * 3000,
    hopProgress: 0,
    walkPhase: 0,
    legBackAngle: 0,
    legFrontAngle: 0,
    squash: 1,
    waddle: 0,
    headBob: 0,
    bodyBounce: 0,
  });
  const [isMoving, setIsMoving] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [extraStyle, setExtraStyle] = useState("");

  // 이동 범위: 스트립(=뷰포트 폭) 밖으로 나가면 가로 스크롤이 생기므로 폭을 실측해 제한
  const boundsRef = useRef({ min: -120, max: 120 });

  const measureBounds = useCallback(() => {
    const stripW = containerRef.current?.parentElement?.clientWidth ?? 0;
    if (!stripW) return;
    // 토끼는 이동 중 1.3배로 늘어나므로 최대 폭 기준
    const maxW = info.kind === "rabbit" ? info.size * 1.3 : info.size;
    const originLeft = (baseX / 100) * stripW;
    const min = Math.max(-120, -originLeft);
    const max = Math.min(120, stripW - maxW - originLeft);
    boundsRef.current = { min, max: Math.max(min, max) };
  }, [info.kind, info.size, baseX]);

  useEffect(() => {
    measureBounds();
    window.addEventListener("resize", measureBounds);
    return () => window.removeEventListener("resize", measureBounds);
  }, [measureBounds]);

  const startMove = useCallback(() => {
    const s = stateRef.current;
    const kind = info.kind;
    const { min, max } = boundsRef.current;
    const clamp = (x: number) => Math.max(min, Math.min(max, x));

    // 깡총: 30~70px 점프 / 알파카·거위: 40~100px 이동
    const dist = kind === "rabbit" ? 30 + Math.random() * 40 : 40 + Math.random() * 60;
    const dir = Math.random() > 0.5 ? 1 : -1;
    s.targetX = clamp(s.x + dir * dist);
    // 가장자리에 막히면 반대 방향으로 (제자리에 붙어있지 않도록)
    if (Math.abs(s.targetX - s.x) < 5) s.targetX = clamp(s.x - dir * dist);

    s.facing = s.targetX > s.x ? 1 : -1;
    s.phase = "moving";
    s.hopProgress = 0;
    s.walkPhase = 0;
    setFacing(s.facing);
    setIsMoving(true);
  }, [info.kind]);

  useEffect(() => {
    let frame: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;
      const s = stateRef.current;
      const kind = info.kind;

      if (s.phase === "idle") {
        s.timer -= dt;
        if (s.timer <= 0) {
          startMove();
        }
      } else if (kind === "rabbit") {
        // 토끼 깡총 hop
        s.hopProgress += dt / 1400; // 1.4초 per hop

        if (s.hopProgress < 0.15) {
          const t = s.hopProgress / 0.15;
          s.squash = 1 - t * 0.12;
          s.y = 0;
        } else if (s.hopProgress < 0.55) {
          const t = (s.hopProgress - 0.15) / 0.4;
          s.squash = 1 + t * 0.05;
          s.y = -Math.sin(t * Math.PI) * 18;
          const dx = s.targetX - s.x;
          s.x += dx * (dt / 700);

          // 다리 애니메이션
          s.legBackAngle = 30 - t * 55;
          s.legFrontAngle = -10 + t * 30;
        } else if (s.hopProgress < 0.8) {
          const t = (s.hopProgress - 0.55) / 0.25;
          s.squash = 1.05 - t * 0.15;
          s.y = -Math.sin((1 - t) * Math.PI * 0.5) * 18;
          s.x += (s.targetX - s.x) * (dt / 500);
          s.legBackAngle = -25 + t * 25;
          s.legFrontAngle = 20 - t * 20;
        } else if (s.hopProgress < 1.0) {
          const t = (s.hopProgress - 0.8) / 0.2;
          s.squash = 0.9 + t * 0.1;
          s.y = 0;
          s.legBackAngle = 0;
          s.legFrontAngle = 0;
        } else {
          s.phase = "idle";
          s.timer = 2500 + Math.random() * 4000;
          s.y = 0;
          s.squash = 1;
          setIsMoving(false);
        }

        // 다리 DOM 업데이트
        if (sideRef.current) {
          const lb = sideRef.current.querySelector(".leg-back") as HTMLElement;
          const lf = sideRef.current.querySelector(".leg-front") as HTMLElement;
          const lbi = sideRef.current.querySelector(".leg-back-inner") as HTMLElement;
          const lfi = sideRef.current.querySelector(".leg-front-inner") as HTMLElement;
          if (lb) lb.style.transform = `rotate(${s.legBackAngle}deg)`;
          if (lf) lf.style.transform = `rotate(${s.legFrontAngle}deg)`;
          if (lbi) lbi.style.transform = `rotate(${s.legBackAngle * 0.7}deg)`;
          if (lfi) lfi.style.transform = `rotate(${s.legFrontAngle * 0.7}deg)`;
        }
      } else if (kind === "alpaca") {
        // 알파카 4족보행
        const speed = 0.22;
        const dx = s.targetX - s.x;
        if (Math.abs(dx) < 3) {
          s.phase = "idle";
          s.timer = 3000 + Math.random() * 5000;
          setIsMoving(false);
        } else {
          s.x += Math.sign(dx) * speed * (dt / 16);
          s.walkPhase += dt * 0.004;
          s.bodyBounce = Math.sin(s.walkPhase * 4) * 1.5;
          s.y = -s.bodyBounce;

          if (sideRef.current) {
            const legAngle = 16;
            const p = s.walkPhase;
            const bl = sideRef.current.querySelector(".leg-back-left") as HTMLElement;
            const br = sideRef.current.querySelector(".leg-back-right") as HTMLElement;
            const fl = sideRef.current.querySelector(".leg-front-left") as HTMLElement;
            const fr = sideRef.current.querySelector(".leg-front-right") as HTMLElement;
            if (bl) bl.style.transform = `rotate(${Math.sin(p * 4) * legAngle}deg)`;
            if (fr) fr.style.transform = `rotate(${Math.sin(p * 4) * legAngle}deg)`;
            if (br) br.style.transform = `rotate(${Math.sin(p * 4 + Math.PI) * legAngle}deg)`;
            if (fl) fl.style.transform = `rotate(${Math.sin(p * 4 + Math.PI) * legAngle}deg)`;
          }
        }
      } else {
        // 거위 뒤뚱
        const speed = 0.18;
        const dx = s.targetX - s.x;
        if (Math.abs(dx) < 3) {
          s.phase = "idle";
          s.timer = 2500 + Math.random() * 4000;
          setIsMoving(false);
        } else {
          s.x += Math.sign(dx) * speed * (dt / 16);
          s.walkPhase += dt * 0.005;
          s.waddle = Math.sin(s.walkPhase * 5) * 2.5;
          s.headBob = Math.sin(s.walkPhase * 5 + 1) * 1.5;
          s.y = -Math.abs(s.waddle) * 0.3;

          if (sideRef.current) {
            const legAngle = 18;
            const p = s.walkPhase;
            const ll = sideRef.current.querySelector(".leg-left") as HTMLElement;
            const lr = sideRef.current.querySelector(".leg-right") as HTMLElement;
            const head = sideRef.current.querySelector(".head") as HTMLElement;
            if (ll) ll.style.transform = `rotate(${Math.sin(p * 5) * legAngle}deg)`;
            if (lr) lr.style.transform = `rotate(${Math.sin(p * 5 + Math.PI) * legAngle}deg)`;
            if (head) head.style.transform = `translateX(${s.headBob}px)`;
          }
        }
      }

      // 리사이즈·회전으로 범위가 좁아진 경우 보정
      s.x = Math.max(boundsRef.current.min, Math.min(boundsRef.current.max, s.x));

      setPos({ x: s.x, y: s.y });

      if (kind === "rabbit" && s.phase === "moving") {
        setExtraStyle(`scaleY(${s.squash})`);
      } else if (kind === "goose" && s.phase === "moving") {
        setExtraStyle(`rotate(${s.waddle * 0.4}deg)`);
      } else {
        setExtraStyle("");
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [info.kind, startMove]);

  const sideHTML = getSideHTML(type);
  const sizeW = isMoving && info.kind === "rabbit" ? info.size * 1.3 : info.size;
  const sizeH = isMoving && info.kind === "rabbit" ? info.size * 0.8 : info.size;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 pointer-events-none select-none"
      style={{
        left: `${baseX}%`,
        width: sizeW,
        height: sizeH,
        transform: `translate(${pos.x}px, ${pos.y}px) scaleX(${facing}) ${extraStyle}`,
        willChange: "transform",
      }}
      aria-label={info.label}
      role="img"
    >
      {/* 정면 (idle) */}
      <div
        style={{
          opacity: isMoving ? 0 : 1,
          transition: "opacity 0.3s",
          position: "absolute",
          inset: 0,
        }}
      >
        <FrontIcon type={type} />
      </div>
      {/* 옆모습 (이동) */}
      <div
        ref={sideRef}
        style={{
          opacity: isMoving ? 1 : 0,
          transition: "opacity 0.3s",
          position: "absolute",
          inset: 0,
        }}
        dangerouslySetInnerHTML={{ __html: sideHTML }}
      />
    </div>
  );
}

/* =============================================
 * AnimalStrip: 섹션 사이에 배치
 * ============================================= */
export function AnimalStrip({ animals }: { animals?: AnimalType[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const list = animals ?? (Object.keys(animalRegistry) as AnimalType[]);
  const spacing = 80 / (list.length + 1);

  return (
    <div className="relative w-full h-20 overflow-visible" aria-hidden="true">
      {list.map((type, i) => (
        <Animal key={`${type}-${i}`} type={type} baseX={10 + spacing * (i + 1)} />
      ))}
    </div>
  );
}
