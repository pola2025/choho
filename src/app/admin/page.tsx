import Link from "next/link";
import { Image, Coffee, FileText, Settings } from "lucide-react";

const quickLinks = [
  {
    href: "/admin/images",
    label: "이미지 관리",
    description: "사이트 이미지 업로드 및 관리",
    icon: Image,
    color: "bg-blue-500",
  },
  {
    href: "/admin/menu",
    label: "카페 메뉴",
    description: "초리골164 카페 메뉴 관리",
    icon: Coffee,
    color: "bg-amber-500",
  },
  {
    href: "/admin/settings",
    label: "설정",
    description: "사이트 설정 및 정보 관리",
    icon: Settings,
    color: "bg-gray-500",
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-1">
          초호펜션 웹사이트를 관리합니다
        </p>
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
            >
              <div
                className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {link.label}
              </h2>
              <p className="text-sm text-gray-500">{link.description}</p>
            </Link>
          );
        })}
      </div>

      {/* 사용 안내 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          사용 안내
        </h2>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">이미지 업로드</p>
              <p>
                이미지 관리 페이지에서 새 이미지를 업로드하면 자동으로
                public/images 폴더에 저장됩니다.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">이미지 적용</p>
              <p>
                업로드된 이미지의 경로를 복사하여 해당 컴포넌트나 데이터
                파일에서 사용하세요.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">카페 메뉴 관리</p>
              <p>
                카페 메뉴 페이지에서 초리골164 카페의 메뉴를 추가, 수정,
                삭제할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
