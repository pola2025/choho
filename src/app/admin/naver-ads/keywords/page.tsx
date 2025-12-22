"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  RefreshCw,
  TrendingUp,
  MousePointer,
  Eye,
  Wallet,
  ArrowUpDown,
  Calendar,
  Award,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import Link from "next/link";

// 타입 정의
interface KeywordStat {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  cost: number;
  conversions: number;
}

type PeriodType = "weekly" | "monthly" | "yearly" | "cumulative";
type SortType = "clicks" | "impressions" | "cost" | "ctr" | "cpc";

// 포맷 헬퍼
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  return num.toLocaleString() + "원";
}

// 효율 등급 계산 (CTR과 CPC 기반)
function getEfficiencyGrade(ctr: number, cpc: number): { grade: string; color: string; bgColor: string } {
  // A등급: CTR >= 3% AND CPC <= 300원
  if (ctr >= 3 && cpc <= 300) {
    return { grade: "A", color: "text-green-700", bgColor: "bg-green-100" };
  }
  // B등급: CTR >= 1.5% AND CPC <= 500원
  if (ctr >= 1.5 && cpc <= 500) {
    return { grade: "B", color: "text-blue-700", bgColor: "bg-blue-100" };
  }
  // C등급: 그 외
  return { grade: "C", color: "text-gray-700", bgColor: "bg-gray-100" };
}

// 날짜 범위 계산
function getDateRange(period: PeriodType): { startDate: string; endDate: string; label: string } {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  switch (period) {
    case "weekly": {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      return {
        startDate: formatDate(weekStart),
        endDate: formatDate(today),
        label: `${formatDate(weekStart)} ~ ${formatDate(today)}`,
      };
    }
    case "monthly": {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: formatDate(monthStart),
        endDate: formatDate(today),
        label: `${today.getFullYear()}년 ${today.getMonth() + 1}월`,
      };
    }
    case "yearly": {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: formatDate(yearStart),
        endDate: formatDate(today),
        label: `${today.getFullYear()}년`,
      };
    }
    case "cumulative": {
      // 2024년 1월부터 (데이터 시작점)
      return {
        startDate: "2024-01-01",
        endDate: formatDate(today),
        label: "2024년 1월 ~ 현재",
      };
    }
  }
}

// 버블 차트 색상
const BUBBLE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function KeywordAnalysisPage() {
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [sortBy, setSortBy] = useState<SortType>("clicks");
  const [isLoading, setIsLoading] = useState(true);
  const [keywords, setKeywords] = useState<KeywordStat[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => getDateRange(period), [period]);
  const topN = period === "cumulative" ? 20 : 10;
  const [loadedPeriod, setLoadedPeriod] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);

  // 데이터 로드 (Airtable 캐시에서)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setKeywords([]); // 기존 데이터 초기화하여 로딩 상태 명확히

    try {
      // 시작/종료 월 계산
      const startYearMonth = dateRange.startDate.slice(0, 7); // YYYY-MM
      const endYearMonth = dateRange.endDate.slice(0, 7);

      console.log(`[키워드 캐시] 조회: ${startYearMonth} ~ ${endYearMonth}`);

      // Airtable 캐시에서 직접 조회 (naver-keywords-sync 대신 range 조회)
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const res = await fetch(`/api/analytics?type=naver-keywords-sync&${params}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[키워드 캐시] 응답: ${data.keywords?.length || 0}개, period: ${data.period}`);
        setKeywords(data.keywords || []);
        setLoadedPeriod(data.period || `${startYearMonth} ~ ${endYearMonth}`);
        setDataSource("airtable");
      } else {
        setError("캐시 데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("Failed to load keywords:", err);
      setError("캐시 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 정렬된 키워드
  const sortedKeywords = useMemo(() => {
    const sorted = [...keywords].sort((a, b) => {
      switch (sortBy) {
        case "clicks":
          return b.clicks - a.clicks;
        case "impressions":
          return b.impressions - a.impressions;
        case "cost":
          return b.cost - a.cost;
        case "ctr":
          return b.ctr - a.ctr;
        case "cpc": {
          const cpcA = a.clicks > 0 ? a.cost / a.clicks : 0;
          const cpcB = b.clicks > 0 ? b.cost / b.clicks : 0;
          return cpcA - cpcB; // 낮은 CPC가 좋음
        }
        default:
          return b.clicks - a.clicks;
      }
    });
    return sorted.slice(0, topN);
  }, [keywords, sortBy, topN]);

  // 전체 통계
  const totals = useMemo(() => {
    const sum = keywords.reduce(
      (acc, kw) => ({
        clicks: acc.clicks + kw.clicks,
        impressions: acc.impressions + kw.impressions,
        cost: acc.cost + kw.cost,
        conversions: acc.conversions + kw.conversions,
      }),
      { clicks: 0, impressions: 0, cost: 0, conversions: 0 }
    );

    return {
      ...sum,
      avgCtr: sum.impressions > 0 ? (sum.clicks / sum.impressions) * 100 : 0,
      avgCpc: sum.clicks > 0 ? sum.cost / sum.clicks : 0,
    };
  }, [keywords]);

  // 기간 탭
  const periods: { id: PeriodType; label: string }[] = [
    { id: "weekly", label: "주간" },
    { id: "monthly", label: "월간" },
    { id: "yearly", label: "연간" },
    { id: "cumulative", label: "누적" },
  ];

  // 정렬 옵션
  const sortOptions: { id: SortType; label: string }[] = [
    { id: "clicks", label: "클릭수 순" },
    { id: "impressions", label: "노출수 순" },
    { id: "cost", label: "광고비 순" },
    { id: "ctr", label: "CTR 순" },
    { id: "cpc", label: "CPC 순 (낮은순)" },
  ];

  if (isLoading && keywords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-gray-500">키워드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/naver-ads"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-6 h-6" />
              키워드 효율 분석
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              기간별 키워드 성과를 분석하고 효율을 측정합니다
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 기간 선택 탭 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">{dateRange.label}</span>
          {loadedPeriod && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              캐시: {loadedPeriod}
            </span>
          )}
          {isLoading && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">로딩중...</span>
            </div>
          )}
        </div>

        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 전체 통계 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Search className="w-4 h-4" />
            등록 키워드
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{keywords.length}개</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <MousePointer className="w-4 h-4" />
            총 클릭수
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-blue-600">{formatNumber(totals.clicks)}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Eye className="w-4 h-4" />
            총 노출수
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.impressions)}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Wallet className="w-4 h-4" />
            총 광고비
          </div>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.cost)}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            평균 CTR
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-purple-600">{totals.avgCtr.toFixed(2)}%</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Award className="w-4 h-4" />
            평균 CPC
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(Math.round(totals.avgCpc))}</p>
          )}
        </div>
      </div>

      {/* 키워드 TOP N 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          TOP {topN} 키워드 ({sortOptions.find((o) => o.id === sortBy)?.label})
          {isLoading && (
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          )}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : sortedKeywords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">순위</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">키워드</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">CPC</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">효율등급</th>
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.map((kw, index) => {
                  const cpc = kw.clicks > 0 ? kw.cost / kw.clicks : 0;
                  const grade = getEfficiencyGrade(kw.ctr, cpc);
                  return (
                    <tr key={kw.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            index < 3 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{kw.keyword}</td>
                      <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                        {formatNumber(kw.clicks)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{formatNumber(kw.impressions)}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{kw.ctr.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(kw.cost)}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {kw.clicks > 0 ? formatCurrency(Math.round(cpc)) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${grade.bgColor} ${grade.color}`}
                        >
                          {grade.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400">
            키워드 데이터가 없습니다
          </div>
        )}
      </div>

      {/* 시각화 차트 */}
      {sortedKeywords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 클릭수 막대 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              키워드별 클릭수 비교
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedKeywords.slice(0, 10).map((kw) => ({
                    keyword: kw.keyword.length > 6 ? kw.keyword.slice(0, 6) + "..." : kw.keyword,
                    클릭수: kw.clicks,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="keyword" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Bar dataKey="클릭수" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 광고비 막대 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              키워드별 광고비 비교
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...sortedKeywords]
                    .sort((a, b) => b.cost - a.cost)
                    .slice(0, 10)
                    .map((kw) => ({
                      keyword: kw.keyword.length > 6 ? kw.keyword.slice(0, 6) + "..." : kw.keyword,
                      광고비: Math.round(kw.cost / 1000),
                    }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="keyword" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value) * 1000)} />
                  <Bar dataKey="광고비" fill="#10b981" radius={[0, 4, 4, 0]} name="광고비 (천원)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 효율성 버블 차트 (CTR vs CPC vs 클릭수) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              키워드 효율성 분석 (CTR vs CPC)
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              버블 크기 = 클릭수 | 우상단(높은 CTR, 낮은 CPC) = 효율적인 키워드
            </p>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="cpc"
                    name="CPC"
                    unit="원"
                    tick={{ fontSize: 11 }}
                    label={{ value: "CPC (원) - 낮을수록 좋음", position: "bottom", fontSize: 12 }}
                    reversed
                  />
                  <YAxis
                    type="number"
                    dataKey="ctr"
                    name="CTR"
                    unit="%"
                    tick={{ fontSize: 11 }}
                    label={{ value: "CTR (%) - 높을수록 좋음", angle: -90, position: "left", fontSize: 12 }}
                  />
                  <ZAxis type="number" dataKey="clicks" range={[50, 500]} name="클릭수" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-gray-900">{data.keyword}</p>
                          <p className="text-sm text-gray-600">CTR: {data.ctr.toFixed(2)}%</p>
                          <p className="text-sm text-gray-600">CPC: {formatCurrency(Math.round(data.cpc))}</p>
                          <p className="text-sm text-gray-600">클릭수: {formatNumber(data.clicks)}</p>
                          <p className="text-sm text-gray-600">광고비: {formatCurrency(data.cost)}</p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Scatter
                    name="키워드"
                    data={sortedKeywords
                      .filter((kw) => kw.clicks > 0)
                      .map((kw) => ({
                        keyword: kw.keyword,
                        ctr: kw.ctr,
                        cpc: kw.clicks > 0 ? kw.cost / kw.clicks : 0,
                        clicks: kw.clicks,
                        cost: kw.cost,
                      }))}
                    fill="#8884d8"
                  >
                    {sortedKeywords
                      .filter((kw) => kw.clicks > 0)
                      .map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BUBBLE_COLORS[index % BUBBLE_COLORS.length]} />
                      ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* 효율등급 범례 */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold">
                  A
                </span>
                <span className="text-gray-600">CTR &ge; 3%, CPC &le; 300원</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold">
                  B
                </span>
                <span className="text-gray-600">CTR &ge; 1.5%, CPC &le; 500원</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold">
                  C
                </span>
                <span className="text-gray-600">그 외</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 효율등급별 키워드 분포 */}
      {sortedKeywords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            효율등급별 키워드 분포
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["A", "B", "C"].map((grade) => {
              const gradeKeywords = sortedKeywords.filter((kw) => {
                const cpc = kw.clicks > 0 ? kw.cost / kw.clicks : 0;
                return getEfficiencyGrade(kw.ctr, cpc).grade === grade;
              });
              const gradeInfo = getEfficiencyGrade(grade === "A" ? 3 : grade === "B" ? 1.5 : 0, grade === "A" ? 300 : grade === "B" ? 500 : 1000);

              return (
                <div key={grade} className={`rounded-xl p-4 ${gradeInfo.bgColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-2xl font-bold ${gradeInfo.color}`}>{grade}등급</span>
                    <span className={`text-lg font-semibold ${gradeInfo.color}`}>{gradeKeywords.length}개</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {gradeKeywords.slice(0, 5).map((kw) => (
                      <div key={kw.keyword} className="text-sm text-gray-700 truncate">
                        {kw.keyword}
                      </div>
                    ))}
                    {gradeKeywords.length > 5 && (
                      <div className="text-sm text-gray-500">+{gradeKeywords.length - 5}개 더</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
