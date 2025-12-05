import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "초호 소개 | 초호펜션",
  description: "1947년부터 이어온 초호의 이야기. 나누고 베푸는 마음으로 초리골에서 실천된 초호정의 기적을 만나보세요.",
};

// 타임라인 데이터 (이미지 포함)
const timelineData = [
  {
    year: "1947",
    title: "맨손으로 완성된 초호정",
    description:
      "일제강점기 직후 어려운 상황에서 초호 우종하 선생은 마을 주민들에게 연못 공사를 의뢰하고 품삯으로 식량을 제공했습니다. 중장비 없이 맨손과 호미로 완성된 초호정은 나눔의 기적이었습니다.",
    highlight: "나눔으로 일궈진 연못 초호정",
    image: "/images/history/history-2-lions.webp",
  },
  {
    year: "1968",
    title: "대대로 이어가는 초호의 가업",
    description:
      "우씨 일가의 집성촌이기도 했던 초리골에서 마을에서 성장한 가족들이 대대로 가업을 이어가며 초호쉼터를 정성껏 가꾸고 있습니다.",
    highlight: "대대로 이어지는 가업",
    image: "/images/history/history-3-chohojung.webp",
  },
  {
    year: "1991",
    title: "초리골의 상징이 된 초호정",
    description:
      "큰 연못은 마을 사람들과 법원리 인근 주민들에게 소중한 나들이 공간으로 활용되었습니다. 날씨가 좋을 때면 소풍을 즐길 수 있었던 초호정은 지역에서 많은 사랑을 받아 왔습니다.",
    highlight: "지역 주민들의 소중한 나들이 공간",
    image: "/images/history/history-4-exterior.webp",
  },
  {
    year: "1997",
    title: "바쁜 현대인들을 위한 쉼터",
    description:
      "대대손손 이곳에 살아왔던 초리골 주민 뿐만 아니라 파주, 고양, 양주, 서울 시민들의 쉼터로 자리잡았습니다. 수많은 기업과 단체의 야유회 및 워크샵 장소로 각광받았습니다.",
    highlight: "시민들의 쉼터로 자리잡다",
    image: "/images/history/history-1997-exterior.webp",
  },
  {
    year: "2008",
    title: "더 많은 분들에게 나눔을 실천",
    description:
      "초호펜션을 더 많은 분들이 편리하게 이용할 수 있도록 꾸준히 확장하고 카페와 펜션 등의 부대시설을 정비하였습니다. 지역사회의 나눔을 실천하는 행사를 적극 후원해왔습니다.",
    highlight: "카페와 펜션 시설 정비",
    image: "/images/history/history-6-cafe.webp",
  },
  {
    year: "2021",
    title: "힐링 공간으로 새롭게 태어나다",
    description:
      "전세계적인 팬데믹 속에서도 꾸준히 초호를 가꿔왔습니다. 카페와 펜션을 이용하는 모든 고객분들에게 편안한 휴식과 쉼의 가치를 전달해드리며 보람을 느끼고 있습니다.",
    highlight: "초호 펜션 리뉴얼, 초리골164 베이커리 카페",
    image: "/images/history/history-7-current.webp",
  },
];

function TimelineItem({
  year,
  title,
  description,
  highlight,
  image,
  isFirst,
}: {
  year: string;
  title: string;
  description: string;
  highlight: string;
  image: string;
  isFirst?: boolean;
}) {
  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Background Image */}
      <div className="relative w-full h-[400px] sm:h-[450px]">
        <Image
          src={image}
          alt={title}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isFirst ? "object-[center_30%]" : "object-center"}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
        <span className="inline-block px-2.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full mb-3">
          {year}
        </span>
        <h3 className="text-base sm:text-lg font-bold mb-1.5">{title}</h3>
        <p className="text-xs text-white/85 mb-2 leading-relaxed">{description}</p>
        <p className="text-xs text-primary font-medium">{highlight}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="-mt-16">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/hero/about-hero.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#3d4a3d",
        }}
      >
        <div className="text-center text-white px-4">
          <p className="text-sm tracking-widest mb-2 opacity-80">ABOUT</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            초호의 역사
          </h1>
          <p className="text-base sm:text-lg opacity-90 max-w-xl mx-auto">
            1947년부터 이어온 나눔과 베풂의 정신
          </p>
        </div>
      </section>

      {/* Intro Section - 초호펜션의 이야기 (반응형 최적화) */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
            초호펜션의 이야기
          </h2>

          {/* 반응형 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {/* 1947-1997 카드 */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary">1947 - 1997</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                1947년 완성된 초호정을 중심으로
                편안한 휴식과 쉼을 누릴 수 있는 공간을
                정성껏 가꿔왔습니다.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>마을 주민들의 손으로 일궈낸 연못</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>지역 주민들의 나들이와 소풍 명소</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>대대로 이어온 가업과 전통</span>
                </li>
              </ul>
            </div>

            {/* 2021 카드 */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-600">2021</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                초리골 숲의 기운을 담아
                자연 속에서 온전히 쉴 수 있는
                새로운 공간을 조성하였습니다.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>펜션 객실 전면 리뉴얼</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>초리골164 베이커리 카페 오픈</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>자연 친화적 힐링 공간 조성</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 하단 문구 */}
          <div className="text-center">
            <p className="text-lg sm:text-xl text-foreground font-medium px-4 py-6 bg-muted/50 rounded-xl inline-block">
              초호펜션에서는 누구나 편안한 쉼을 누릴 수 있습니다.
            </p>
          </div>

          {/* 초호펜션 전경 이미지 */}
          <div className="mt-8 relative rounded-2xl overflow-hidden shadow-xl">
            <div className="relative w-full aspect-[16/9]">
              <Image
                src="/images/history/history-intro.webp"
                alt="초호펜션 전경 - 숲 속에 자리한 펜션과 갈대밭"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                priority
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white text-center text-sm sm:text-base opacity-90">
                초리골 숲 속에 자리한 초호펜션
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Message Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            초호를 찾아주셔서 감사합니다
          </h2>
          <p className="text-sm opacity-80 mb-8">1947년부터 이어온 나눔과 베풂의 정신</p>

          <div className="text-left space-y-4 text-sm sm:text-base opacity-90">
            <p>
              <strong>경제성장을 앞세운 현대화 물결</strong> 속에서 숲과 자연이 훼손되는 안타까움이 컸습니다.
            </p>
            <p>
              <strong>대대로 물려받은 소중한 숲과 땅</strong> 위에 누구나 쉴 수 있는 휴식처를 가꾸고자
              설계에서부터 시공까지 모든 공간에 정성을 가득 담았습니다.
            </p>
            <p>
              <strong>옛날 초호정이 조성될 때 뜻을 담아</strong> 찾는 분들 모두가 일상으로 돌아가기 전까지
              힐링이 되는 공간으로 편안하게 누리셨으면 좋겠습니다.
            </p>
            <p>
              <strong>나누고 베푸는 마음</strong>으로 언제나 초호를 찾는 분들에게 감사인사를 드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section - 초호의 발자취 (이미지 포함) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              초호의 발자취
            </h2>
            <p className="text-muted-foreground">
              초리골에서 실천된 초호정의 기적
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timelineData.map((item, idx) => (
              <TimelineItem
                key={idx}
                year={item.year}
                title={item.title}
                description={item.description}
                highlight={item.highlight}
                image={item.image}
                isFirst={idx === 0}
              />
            ))}
          </div>

          {/* Bottom Badge */}
          <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-sm border border-border">
            <h3 className="text-2xl font-bold text-primary mb-2">나누고 베풀다</h3>
            <p className="text-muted-foreground mb-4">
              초리골에서 실천된 초호정의 기적
            </p>
            <p className="text-3xl font-bold text-primary">SINCE 1947</p>
          </div>
        </div>
      </section>
    </main>
  );
}
