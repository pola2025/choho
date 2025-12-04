const fs = require('fs');

const content = `import { Metadata } from "next";
import { Coffee, Leaf, GlassWater, IceCream } from "lucide-react";

export const metadata: Metadata = {
  title: "초리골164 카페 | 초호펜션",
  description: "넓은 야외공간과 뉴트로한 외관의 카페, 초리골164. 귀여운 거위가족과 함께 이색적인 힐링카페를 만나보세요.",
};

// 메뉴 데이터
const menuData = {
  coffee: {
    title: "COFFEE",
    icon: Coffee,
    items: [
      { name: "아메리카노", hot: "6.0", iced: "6.5" },
      { name: "카페라떼", hot: "6.5", iced: "7.0" },
      { name: "바닐라라떼", hot: "7.0", iced: "7.5" },
      { name: "헤이즐넛라떼", hot: "7.0", iced: "7.5" },
      { name: "카라멜마끼아또", hot: "7.0", iced: "7.5" },
      { name: "아포카토", hot: null, iced: "8.0" },
      { name: "디카페인", hot: "+0.5", iced: "+0.5" },
    ],
  },
  latte: {
    title: "LATTE",
    icon: Coffee,
    items: [
      { name: "아이스초리골흑임자라떼(S)", hot: null, iced: "8.0" },
      { name: "제주말차라떼", hot: "7.0", iced: "7.5" },
      { name: "고구마라떼", hot: "7.0", iced: null },
      { name: "딸기라떼", hot: null, iced: "7.5" },
      { name: "초코라떼", hot: "7.0", iced: "7.5" },
      { name: "샷추가", hot: "+0.5", iced: "+0.5" },
    ],
  },
  tea: {
    title: "TEA",
    icon: Leaf,
    items: [
      { name: "캐모마일", hot: "7.0", iced: "7.5" },
      { name: "히비스커스", hot: "7.0", iced: "7.5" },
      { name: "복숭아 아이스티", hot: null, iced: "7.0" },
      { name: "유자차", hot: "7.0", iced: "7.5" },
      { name: "생강차", hot: "7.0", iced: null },
      { name: "레몬차", hot: null, iced: "7.5", badge: "수제" },
      { name: "레몬콜라다", hot: "8.0", iced: "8.0" },
    ],
  },
  ade: {
    title: "ADE",
    icon: GlassWater,
    items: [
      { name: "레몬베리에이드", hot: null, iced: "8.0", badge: "수제 베리청 + 자몽청(제주)" },
      { name: "자몽에이드", hot: null, iced: "7.5" },
      { name: "청포도에이드", hot: null, iced: "8.0", badge: "수제" },
      { name: "레몬에이드", hot: null, iced: "8.0", badge: "수제" },
    ],
  },
  others: {
    title: "OTHERS",
    icon: IceCream,
    items: [
      { name: "아이스크림", price: "7.5" },
      { name: "딸기요거트스무디", price: "8.0" },
      { name: "커피콩빵 (10개)", price: "5.0" },
      { name: "시루가", price: "0.5" },
      { name: "잉어밥/알파카먹이", price: "1.0" },
      { name: "베이커리", price: "별도" },
    ],
  },
};

// 갤러리 이미지
const galleryImages = [
  { src: "/images/cafe/exterior-1.webp", alt: "카페 외관 전경" },
  { src: "/images/cafe/exterior-2.webp", alt: "카페 입구" },
  { src: "/images/cafe/terrace.webp", alt: "야외 테라스" },
  { src: "/images/cafe/interior-1.webp", alt: "카페 내부 전경" },
  { src: "/images/cafe/interior-2.webp", alt: "카페 내부 좌석" },
  { src: "/images/cafe/interior-3.webp", alt: "카페 라운지" },
  { src: "/images/cafe/interior-4.webp", alt: "카페 바" },
  { src: "/images/cafe/bakery.webp", alt: "베이커리" },
  { src: "/images/cafe/walnut-cake.webp", alt: "커피콩빵" },
];

function MenuSection({
  title,
  items,
  showHotIced = true
}: {
  title: string;
  items: Array<{ name: string; hot?: string | null; iced?: string | null; price?: string; badge?: string }>;
  showHotIced?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <h3 className="text-lg font-bold text-primary mb-4 border-b border-primary/20 pb-2">
        {title}
      </h3>

      {showHotIced && (
        <div className="flex justify-end gap-4 text-xs text-muted-foreground mb-2 pr-2">
          <span className="w-10 text-center">HOT</span>
          <span className="w-10 text-center">ICED</span>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-foreground">{item.name}</span>
              {item.badge && (
                <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </div>
            {showHotIced ? (
              <div className="flex gap-4">
                <span className="w-10 text-center text-muted-foreground">
                  {item.hot || "-"}
                </span>
                <span className="w-10 text-center text-muted-foreground">
                  {item.iced || "-"}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{item.price}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CafePage() {
  return (
    <main className="-mt-16">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/hero/610df693d3781.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#4a5c4a",
        }}
      >
        <div className="text-center text-white px-4">
          <p className="text-sm tracking-widest mb-2 opacity-80">CAFE</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            초리골164
          </h1>
          <p className="text-base sm:text-lg opacity-90 max-w-xl mx-auto">
            넓은 야외공간과 뉴트로한 외관의 카페
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="text-4xl font-bold text-primary">草湖</span>
            <span className="block text-sm text-muted-foreground mt-1">STAY IN CHOHO</span>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            초리골164 (CHORIGOL 164) 카페는 넓은 야외공간과 뉴트로한 외관의 카페입니다.
            <br />
            귀여운 거위가족과 함께 이색적인 힐링카페를 만나보세요.
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">MENU</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MenuSection title={menuData.coffee.title} items={menuData.coffee.items} />
            <MenuSection title={menuData.latte.title} items={menuData.latte.items} />
            <MenuSection title={menuData.tea.title} items={menuData.tea.items} />
            <MenuSection title={menuData.ade.title} items={menuData.ade.items} />
          </div>

          {/* Others - Full Width */}
          <div className="mt-6">
            <MenuSection
              title={menuData.others.title}
              items={menuData.others.items}
              showHotIced={false}
            />
          </div>

          {/* Notice */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-sm text-amber-800">
              <strong>6세부터 1인1메뉴입니다.</strong>
              <br />
              <span className="text-xs">
                음료의 양은 1인 1잔입니다.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">초리골 164 카페 갤러리</h2>
            <p className="text-muted-foreground">
              귀여운 거위가족과 함께 이색적인 힐링카페 초리골 164의 다양한 모습을 만날 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((image, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden bg-neutral-200"
                style={{
                  backgroundImage: \`url('\${image.src}')\`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="w-full h-full hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
`;

fs.writeFileSync('src/app/cafe/page.tsx', content, 'utf8');
console.log('Updated cafe page with local images!');
