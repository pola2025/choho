import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "초호펜션 - 파주 힐링 펜션";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3d5a3d 0%, #2d4a2d 50%, #1d3a1d 100%)",
          position: "relative",
        }}
      >
        {/* 배경 패턴 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* 메인 컨텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {/* 한자 로고 */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: "white",
              marginBottom: 20,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            草湖
          </div>

          {/* 메인 타이틀 */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              marginBottom: 16,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            초호펜션
          </div>

          {/* 서브 타이틀 */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 24,
            }}
          >
            서울에서 1시간, 파주 초리골의 힐링 펜션
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: 80,
              height: 3,
              background: "rgba(255,255,255,0.6)",
              marginBottom: 24,
              borderRadius: 2,
            }}
          />

          {/* 키워드 태그 */}
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {["호수뷰", "Forest", "초리골164 카페"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "10px 24px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 30,
                  fontSize: 20,
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Since 표시 */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 4,
            }}
          >
            SINCE 1947
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
