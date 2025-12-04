import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "초호 소개 | 초호펜션",
  description: "1947년부터 이어온 초호의 이야기. 나누고 베푸는 마음으로 초리골에서 실천된 초호정의 기적을 만나보세요.",
};

// 타임라인 데이터
const timelineData = [
  {
    year: "1947",
    title: "사람들을 위해 나눔을 실천하다",
    description:
      "일제강점기 직후 먹을 것이 부족하고 어려운 상황을 안타깝게 생각했던 초호 우종하 선생은 초리골 및 인근 주민들을 위해 특단의 대책을 실천합니다. 연못을 마을 주민들이 만들도록 하고 품삯으로 식량을 제공한 것입니다.",
    highlight: "맨손과 호미로 일궈진 연못 초호정",
  },
  {
    year: "1947",
    title: "맨손으로 완성된 초호정",
    description:
      "어려운 상황의 사람들에게 희망을 주는 것과 동시에 힘든 시기를 극복할 수 있는 계기가 되었던 당시 초호정 공사는 중장비 없이 사람의 손으로만 완성된 기적이었습니다.",
    highlight: "1947년 완성된 초호정은 맨손의 기적",
  },
  {
    year: "1968",
    title: "대대로 직접 관리하고 가꾸는 초호쉼터",
    description:
      "우씨 일가의 집성촌이기도 했던 초리골에 자리잡아 외부의 도움없이 마을에서 성장하고 자란 가족들이 대대로 가업을 이어가며 초호쉼터를 가꾸고 있습니다.",
    highlight: "대대로 이어지는 가업",
  },
  {
    year: "1991",
    title: "초리골의 상징이 되었던 초호정",
    description:
      "큰 연못은 마을 사람들과 법원리 인근 주민들에게는 소중한 나들이 공간으로 활용되었습니다. 날씨가 좋을 때면 소풍을 즐길 수 있었던 초호정은 예전부터 지역에서 많은 사랑을 받아 왔습니다.",
    highlight: "지역 주민들의 소중한 나들이 공간",
  },
  {
    year: "1997",
    title: "바쁘고 지친 현대인들을 위한 쉼터 조성",
    description:
      "대대손손 이곳에 살아왔던 초리골 주민 뿐만 아니라 파주, 고양, 양주, 서울 시민들의 쉼터로 자리잡았습니다. 수많은 기업과 단체의 야유회 및 워크샵 장소로 각광을 받아온 초호는 초호정의 뜻을 더 크게 실천할 수 있었습니다.",
    highlight: "시민들의 쉼터로 자리잡다",
  },
  {
    year: "2008",
    title: "더 많은 분들에게 나눔을 실천하는 초호",
    description:
      "초호펜션을 더 많은 분들이 편리하게 이용할 수 있도록 꾸준히 확장하고 카페와 펜션 등의 부대시설을 정비하였습니다. 지역사회의 나눔을 실천하는 행사를 적극 후원해왔습니다.",
    highlight: "카페와 펜션 시설 정비",
  },
  {
    year: "2021",
    title: "코로나 19에 지친 몸과 마음을 힐링할 수 있는 곳",
    description:
      "전세계적인 팬데믹에도 저희는 꾸준히 초호를 가꿔오고 있습니다. 카페와 펜션을 이용하는 모든 고객분들에게 편안한 휴식과 쉼의 가치를 전달해드리며, 보람을 느끼고 있습니다.",
    highlight: "초호 펜션 리뉴얼, 초리골164 베이커리 카페",
  },
  {
    year: "2025",
    title: "쾌적한 이용을 위한 시설 업그레이드",
    description:
      "본관건물의 대대적인 리모델링을 통하여 단체 이용 고객의 이용시설을 업그레이드 하였습니다. 누구나 쾌적하고 자연과 함께 할 수 있는 공간을 좀더 편안히 이용할 수 있도록 시설 업그레이드가 완료되었습니다.",
    highlight: "CHOHO 1992 Open",
  },
];

// 더미 공지사항 데이터
const noticeData = [
  {
    id: 1,
    title: "초호쉼터 수영장 운영 종료",
    excerpt: "초호쉼터 수영장은 운영 종료되었습니다.",
    date: "2025-08-21",
    views: 129,
  },
  {
    id: 2,
    title: "초호쉼터 펜션이용 고객 전용 수영장 오픈",
    excerpt: "펜션 이용고객분들을 위한 시원한 여름철 수영장이 오픈됩니다.",
    date: "2025-07-03",
    views: 443,
  },
  {
    id: 3,
    title: "초호쉼터 알파카 먹이주기 이용 안내",
    excerpt: "초호펜션/초리골164베이커리 카페 이용 고객님들 대상으로 알파카 먹이주기 체험이 가능합니다.",
    date: "2025-05-29",
    views: 307,
  },
  {
    id: 4,
    title: "초호쉼터 토끼가족 입주 안내",
    excerpt: "가정의 달 5월을 맞이해서 초호쉼터를 이용해주시는 가족분들이 늘고 있습니다.",
    date: "2025-05-02",
    views: 320,
  },
];

function TimelineItem({
  year,
  title,
  description,
  highlight,
  isLeft,
}: {
  year: string;
  title: string;
  description: string;
  highlight: string;
  isLeft: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 md:gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
      {/* Content */}
      <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
        <div
          className={`bg-white p-6 rounded-xl shadow-sm border border-border ${
            isLeft ? "md:mr-4" : "md:ml-4"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-bold rounded-full mb-3">
            {year}
          </span>
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <p className="text-sm text-primary font-medium">{highlight}</p>
        </div>
      </div>

      {/* Timeline Line - Hidden on mobile */}
      <div className="hidden md:flex flex-col items-center">
        <div className="w-4 h-4 bg-primary rounded-full border-4 border-white shadow" />
        <div className="w-0.5 h-full bg-primary/20 min-h-[100px]" />
      </div>

      {/* Empty space for alternating layout */}
      <div className="hidden md:block flex-1" />
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
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/hero/d490de3afedf5.webp')",
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

      {/* Intro Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              초호펜션의 이야기
            </h2>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <h3 className="text-xl font-bold text-primary">1947 - 1997</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  1947년 완성된 초호정을 중심으로<br />
                  편안한 휴식과 쉼을 누릴 수 있는 공간을<br />
                  정성껏 가꿔왔습니다.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">2021</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  초리골 숲의 기운을 담아<br />
                  자연 속에서 온전히 쉴 수 있는<br />
                  새로운 공간을 조성하였습니다.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-lg text-muted-foreground">
            초호펜션에서는 누구나 편안한 쉼을 누릴 수 있습니다.
          </p>
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

      {/* Timeline Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              초호의 발자취
            </h2>
            <p className="text-muted-foreground">
              초리골에서 실천된 초호정의 기적
            </p>
          </div>

          <div className="space-y-8 md:space-y-0">
            {timelineData.map((item, idx) => (
              <TimelineItem
                key={idx}
                year={item.year}
                title={item.title}
                description={item.description}
                highlight={item.highlight}
                isLeft={idx % 2 === 0}
              />
            ))}
          </div>

          {/* Bottom Badge */}
          <div className="text-center mt-12 p-6 bg-white rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-bold text-primary mb-2">나누고 베풀다</h3>
            <p className="text-muted-foreground text-sm mb-2">
              초리골에서 실천된 초호정의 기적
            </p>
            <p className="text-2xl font-bold text-primary">SINCE 1947</p>
          </div>
        </div>
      </section>

      {/* Notice Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">초리골 소식</h2>
              <p className="text-sm text-muted-foreground mt-1">
                초호펜션 소식 <span className="text-primary">110</span>
              </p>
            </div>
            <Link
              href="/about/journal"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {noticeData.map((notice) => (
              <Link
                key={notice.id}
                href={`/about/journal/${notice.id}`}
                className="block p-4 bg-white rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {notice.excerpt}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    <p>{notice.date}</p>
                    <p>조회 {notice.views}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
