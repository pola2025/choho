"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { SiteImages, SiteImage } from "@/lib/site-images";
import { defaultSiteImages } from "@/lib/site-images";

type SectionKey = keyof SiteImages;

const sections: { key: SectionKey; label: string; color: string }[] = [
  { key: "hero", label: "히어로/배너", color: "bg-blue-500" },
  { key: "gallery", label: "갤러리", color: "bg-purple-500" },
  { key: "rooms", label: "객실", color: "bg-green-500" },
  { key: "facilities", label: "부대시설", color: "bg-orange-500" },
];

export default function ImagesPage() {
  const [siteImages, setSiteImages] = useState<SiteImages>(defaultSiteImages);
  const [selectedSection, setSelectedSection] = useState<SectionKey>("hero");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const [r2Configured, setR2Configured] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  // 이미지 데이터 로드
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/images");
      if (response.ok) {
        const data = await response.json();
        setSiteImages(data);
      }
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentImages = siteImages[selectedSection];

  // 이미지 클릭 시 파일 선택
  const handleImageClick = (imageId: string) => {
    setCurrentImageId(imageId);
    fileInputRef.current?.click();
  };

  // 파일 선택 및 업로드
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentImageId) return;

    setUploadingId(currentImageId);
    setUploadProgress("WebP로 압축 중...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageId", currentImageId);
      formData.append("category", selectedSection);
      formData.append("quality", quality.toString());

      // R2에 업로드
      const uploadResponse = await fetch("/api/upload/r2", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        if (uploadResult.needsConfig) {
          setR2Configured(false);
        }
        throw new Error(uploadResult.error || "업로드 실패");
      }

      setUploadProgress("사이트에 적용 중...");

      // 이미지 데이터 업데이트
      const updateResponse = await fetch("/api/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentImageId,
          src: uploadResult.url,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("이미지 데이터 업데이트 실패");
      }

      // 로컬 상태 업데이트
      setSiteImages((prev) => {
        const updated = JSON.parse(JSON.stringify(prev)) as SiteImages;
        const idx = updated[selectedSection].findIndex(
          (img) => img.id === currentImageId
        );
        if (idx !== -1) {
          updated[selectedSection][idx].src = uploadResult.url;
        }
        return updated;
      });

      // 성공 메시지
      const reduction = uploadResult.compressionRatio;
      setSuccessMessage(
        `이미지가 업데이트되었습니다! (${reduction}% 압축)`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다");
    } finally {
      setUploadingId(null);
      setUploadProgress("");
      setCurrentImageId(null);
      e.target.value = "";
    }
  };

  // 경로 복사
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이미지 관리</h1>
          <p className="text-gray-600 mt-1">
            이미지를 클릭하여 교체하세요. R2에 업로드 후 바로 사이트에 적용됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadImages}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              showSettings
                ? "bg-gray-100 text-gray-900 border-gray-300"
                : "text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            설정
          </button>
        </div>
      </div>

      {/* R2 설정 경고 */}
      {!r2Configured && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">R2 설정이 필요합니다</p>
              <p className="text-sm text-red-600 mt-1">
                .env.local 파일에 R2 환경변수를 설정해주세요:
              </p>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 overflow-x-auto">
{`R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=choho
R2_ENDPOINT=https://b520cb8ed3989e8182bdb020ade36495.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-public-url.r2.dev`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* 설정 패널 */}
      {showSettings && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-4">압축 설정</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WebP 품질: {quality}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50% (작은 파일)</span>
                <span>95% (고품질)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 탭 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setSelectedSection(section.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedSection === section.key
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedSection === section.key ? "bg-white" : section.color
                }`}
              />
              {section.label}
              <span className="text-xs opacity-70">
                ({siteImages[section.key].length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 이미지 그리드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-500" />
          {sections.find((s) => s.key === selectedSection)?.label} 이미지
        </h2>

        <div
          className={`grid gap-4 ${
            selectedSection === "hero"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {currentImages.map((image) => {
            const isUploading = uploadingId === image.id;

            return (
              <div
                key={image.id}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                  isUploading
                    ? "border-blue-400 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-green-400 hover:shadow-lg"
                }`}
              >
                {/* 이미지 */}
                <div
                  className={`relative cursor-pointer ${
                    selectedSection === "hero" ? "aspect-video" : "aspect-square"
                  }`}
                  onClick={() => !isUploading && handleImageClick(image.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />

                  {/* 업로드 중 오버레이 */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                      <span className="text-white text-sm font-medium">
                        {uploadProgress}
                      </span>
                    </div>
                  )}

                  {/* 호버 오버레이 */}
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white" />
                        <span className="text-white text-sm font-medium">
                          클릭하여 교체
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-3 bg-gray-50">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {image.name}
                  </p>
                  {image.room && (
                    <p className="text-xs text-gray-500 mt-0.5">{image.room}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {image.usedIn.join(", ")}
                  </p>

                  {/* URL 복사 버튼 */}
                  <button
                    onClick={() => copyToClipboard(image.src, image.id)}
                    className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {copiedId === image.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        복사됨!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        URL 복사
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">사용 방법</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>교체할 이미지를 클릭합니다</li>
          <li>새 이미지 파일을 선택합니다</li>
          <li>자동으로 WebP로 압축 후 R2에 업로드됩니다</li>
          <li>사이트에 바로 적용됩니다 (새로고침 필요)</li>
        </ol>
      </div>
    </div>
  );
}
