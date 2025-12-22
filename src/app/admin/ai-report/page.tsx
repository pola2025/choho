"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Flame,
  AlertTriangle,
  Eye,
  MousePointer,
  Wallet,
  Target,
  Calendar,
  ChevronDown,
  ChevronRight,
  Database,
} from "lucide-react";
// 캠페인 그룹은 추후 캠페인별 캐시 구현 시 사용
// import { CAMPAIGN_GROUP_TABS, type CampaignGroup } from "@/lib/campaign-groups";
import {
  generateWeeklyInsights,
  generateMonthlyInsights,
  calculateChangeRate,
  type AIReportData,
  type Insight,
  type KeywordAnalysis,
} from "@/lib/ai-insights";

// 타입 정의
interface PeriodStats {
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  cpc: number;
}

interface DailyStat {
  date: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
}

interface KeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  cost: number;
  ctr: number;
  yearMonth?: string;
}

type PresetType = "weekly" | "monthly" | "custom";

// 숫자 포맷팅
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

// 금액 포맷팅
function formatCurrency(num: number): string {
  return num.toLocaleString() + "원";
}

// 날짜 포맷 (YYYY-MM-DD)
function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// 변화율 표시 컴포넌트
function ChangeIndicator({
  value,
  isPercent = true,
  isInverse = false,
  size = "sm",
}: {
  value: number;
  isPercent?: boolean;
  isInverse?: boolean;
  size?: "sm" | "lg";
}) {
  const isPositive = isInverse ? value < 0 : value > 0;
  const isNegative = isInverse ? value > 0 : value < 0;

  const sizeClass = size === "lg" ? "text-sm" : "text-xs";
  const iconSize = size === "lg" ? "w-4 h-4" : "w-3 h-3";

  if (Math.abs(value) < 0.01) {
    return (
      <span className={`flex items-center gap-1 text-gray-400 ${sizeClass}`}>
        <Minus className={iconSize} />
        변동없음
      </span>
    );
  }

  return (
    <span
      className={`flex items-center gap-1 ${sizeClass} ${
        isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className={iconSize} />
      ) : (
        <ArrowDownRight className={iconSize} />
      )}
      {isPercent
        ? `${Math.abs(value).toFixed(1)}%`
        : `${value > 0 ? "+" : ""}${value.toFixed(2)}%p`}
    </span>
  );
}

// 인사이트 카드 컴포넌트
function InsightCard({ insight }: { insight: Insight }) {
  const getIcon = () => {
    switch (insight.type) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case "positive":
        return "bg-green-50 border-green-200";
      case "negative":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor()}`}>
      <div className="mt-0.5">{getIcon()}</div>
      <p className="text-sm text-gray-700">{insight.message}</p>
    </div>
  );
}

// 비교 카드 컴포넌트
function ComparisonCard({
  label,
  icon: Icon,
  current,
  previous,
  changeRate,
  isCurrency = false,
  isPercent = false,
  isInverse = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  current: number;
  previous: number;
  changeRate: number;
  isCurrency?: boolean;
  isPercent?: boolean;
  isInverse?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {isCurrency
          ? formatCurrency(current)
          : isPercent
          ? `${current.toFixed(2)}%`
          : formatNumber(current)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          이전:{" "}
          {isCurrency
            ? formatCurrency(previous)
            : isPercent
            ? `${previous.toFixed(2)}%`
            : formatNumber(previous)}
        </span>
        <ChangeIndicator
          value={changeRate}
          isPercent={!isPercent}
          isInverse={isInverse}
        />
      </div>
    </div>
  );
}

// 키워드 테이블 컴포넌트
function KeywordTable({
  keywords,
  title,
  type,
}: {
  keywords: KeywordAnalysis[];
  title: string;
  type: "gainers" | "losers" | "all";
}) {
  const [isExpanded, setIsExpanded] = useState(type === "all");

  const getIcon = () => {
    if (type === "gainers") return <Flame className="w-4 h-4 text-orange-500" />;
    if (type === "losers") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return null;
  };

  const getBgColor = () => {
    if (type === "gainers") return "bg-orange-50";
    if (type === "losers") return "bg-amber-50";
    return "bg-white";
  };

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-gray-200 overflow-hidden ${getBgColor()}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="text-sm text-gray-500">({keywords.length}개)</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-200 bg-white/50">
                <th className="text-left py-2 px-4 font-medium text-gray-600">키워드</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600">이번 기간</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600">이전 기간</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600">변화율</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600">노출수</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600">CTR</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr key={kw.keyword} className="border-t border-gray-100 hover:bg-white/50">
                  <td className="py-2 px-4 font-medium text-gray-900">{kw.keyword}</td>
                  <td className="py-2 px-4 text-right text-gray-700">
                    {formatNumber(kw.thisWeekClicks)}
                  </td>
                  <td className="py-2 px-4 text-right text-gray-500">
                    {formatNumber(kw.lastWeekClicks)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span
                      className={`${
                        kw.changeRate > 0
                          ? "text-green-600"
                          : kw.changeRate < 0
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    >
                      {kw.changeRate > 0 ? "+" : ""}
                      {kw.changeRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right text-gray-700">
                    {formatNumber(kw.impressions)}
                  </td>
                  <td className="py-2 px-4 text-right text-gray-700">
                    {kw.ctr.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 날짜 범위 계산 함수들
function getWeeklyRanges() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // 이번 주 월요일
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + mondayOffset);

  // 지난 주
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday);
  lastSunday.setDate(thisMonday.getDate() - 1);

  return {
    current: { start: formatDate(thisMonday), end: formatDate(today) },
    previous: { start: formatDate(lastMonday), end: formatDate(lastSunday) },
  };
}

function getMonthlyRanges() {
  const today = new Date();
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    current: { start: formatDate(thisMonthStart), end: formatDate(today) },
    previous: { start: formatDate(lastMonthStart), end: formatDate(lastMonthEnd) },
  };
}

export default function AIReportPage() {
  const [preset, setPreset] = useState<PresetType>("weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 커스텀 날짜 범위
  const [customCurrentStart, setCustomCurrentStart] = useState("");
  const [customCurrentEnd, setCustomCurrentEnd] = useState("");
  const [customPreviousStart, setCustomPreviousStart] = useState("");
  const [customPreviousEnd, setCustomPreviousEnd] = useState("");

  // 캐시 데이터 상태
  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);

  // 현재 날짜 범위 계산
  const dateRanges = useMemo(() => {
    if (preset === "weekly") {
      return getWeeklyRanges();
    } else if (preset === "monthly") {
      return getMonthlyRanges();
    } else {
      // 커스텀
      return {
        current: { start: customCurrentStart, end: customCurrentEnd },
        previous: { start: customPreviousStart, end: customPreviousEnd },
      };
    }
  }, [preset, customCurrentStart, customCurrentEnd, customPreviousStart, customPreviousEnd]);

  // 일별 데이터에서 기간별 통계 집계
  const aggregateStats = (data: DailyStat[], startDate: string, endDate: string): PeriodStats | null => {
    if (!startDate || !endDate) return null;

    const filtered = data.filter((d) => d.date >= startDate && d.date <= endDate);

    if (filtered.length === 0) return null;

    const totals = filtered.reduce(
      (acc, d) => ({
        impressions: acc.impressions + (d.impCnt || 0),
        clicks: acc.clicks + (d.clkCnt || 0),
        cost: acc.cost + (d.salesAmt || 0),
      }),
      { impressions: 0, clicks: 0, cost: 0 }
    );

    return {
      startDate,
      endDate,
      impressions: totals.impressions,
      clicks: totals.clicks,
      cost: totals.cost,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
    };
  };

  // 기간별 데이터 계산
  const currentPeriod = useMemo(
    () => aggregateStats(dailyData, dateRanges.current.start, dateRanges.current.end),
    [dailyData, dateRanges]
  );

  const previousPeriod = useMemo(
    () => aggregateStats(dailyData, dateRanges.previous.start, dateRanges.previous.end),
    [dailyData, dateRanges]
  );

  // 변화율 계산
  const changes = useMemo(() => {
    if (!currentPeriod || !previousPeriod) return null;

    return {
      impressions: calculateChangeRate(currentPeriod.impressions, previousPeriod.impressions),
      clicks: calculateChangeRate(currentPeriod.clicks, previousPeriod.clicks),
      cost: calculateChangeRate(currentPeriod.cost, previousPeriod.cost),
      ctr: currentPeriod.ctr - previousPeriod.ctr,
      cpc: calculateChangeRate(currentPeriod.cpc, previousPeriod.cpc),
    };
  }, [currentPeriod, previousPeriod]);

  // 키워드 분석 (이번달 vs 지난달 비교)
  const keywordAnalysis = useMemo((): KeywordAnalysis[] => {
    if (keywordData.length === 0) return [];

    const monthlyRanges = getMonthlyRanges();
    const thisMonth = monthlyRanges.current.start.slice(0, 7);
    const lastMonth = monthlyRanges.previous.start.slice(0, 7);

    // 월별로 그룹화
    const thisMonthKw = keywordData.filter((k) => k.yearMonth === thisMonth);
    const lastMonthKw = keywordData.filter((k) => k.yearMonth === lastMonth);

    // 지난달 데이터 맵
    const lastMonthMap = new Map(lastMonthKw.map((k) => [k.keyword, k.clicks]));

    // 분석 결과 생성
    return thisMonthKw
      .map((kw) => {
        const lastClicks = lastMonthMap.get(kw.keyword) || 0;
        const changeRate = calculateChangeRate(kw.clicks, lastClicks);

        return {
          keyword: kw.keyword,
          thisWeekClicks: kw.clicks,
          lastWeekClicks: lastClicks,
          changeRate,
          impressions: kw.impressions,
          ctr: kw.ctr,
          trend: changeRate > 10 ? "up" : changeRate < -10 ? "down" : "stable",
        } as KeywordAnalysis;
      })
      .sort((a, b) => b.thisWeekClicks - a.thisWeekClicks);
  }, [keywordData]);

  // 인사이트 생성
  const insights = useMemo((): Insight[] => {
    if (!currentPeriod || !previousPeriod || !changes) return [];

    const reportData: AIReportData = {
      weeklyComparison: {
        thisWeek: { ...currentPeriod, conversions: 0 },
        lastWeek: { ...previousPeriod, conversions: 0 },
        changes,
      },
      monthlyComparison: {
        thisMonth: { ...currentPeriod, conversions: 0 },
        lastMonth: { ...previousPeriod, conversions: 0 },
        changes,
      },
      keywords: keywordAnalysis,
    };

    return preset === "weekly"
      ? generateWeeklyInsights(reportData)
      : generateMonthlyInsights(reportData);
  }, [currentPeriod, previousPeriod, changes, keywordAnalysis, preset]);

  // 키워드 분류
  const topGainers = useMemo(
    () =>
      keywordAnalysis
        .filter((k) => k.changeRate > 20 && k.thisWeekClicks >= 3)
        .sort((a, b) => b.changeRate - a.changeRate)
        .slice(0, 5),
    [keywordAnalysis]
  );

  const topLosers = useMemo(
    () =>
      keywordAnalysis
        .filter((k) => k.changeRate < -20 && k.lastWeekClicks >= 3)
        .sort((a, b) => a.changeRate - b.changeRate)
        .slice(0, 5),
    [keywordAnalysis]
  );

  // 초기 데이터 로드 (페이지 로드 시 한 번만)
  useEffect(() => {
    // 커스텀 날짜 초기값 설정
    const ranges = getWeeklyRanges();
    setCustomCurrentStart(ranges.current.start);
    setCustomCurrentEnd(ranges.current.end);
    setCustomPreviousStart(ranges.previous.start);
    setCustomPreviousEnd(ranges.previous.end);

    // 캐시 데이터 로드
    const loadCacheData = async () => {
      try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const startDate = formatDate(threeMonthsAgo);
        const endDate = formatDate(new Date());

        const [dailyRes, keywordsRes] = await Promise.all([
          fetch(`/api/analytics?type=naver-daily&startDate=${startDate}&endDate=${endDate}`),
          fetch(`/api/analytics?type=naver-keywords&months=3`),
        ]);

        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setDailyData(data.daily || []);
        }

        if (keywordsRes.ok) {
          const data = await keywordsRes.json();
          setKeywordData(data.keywords || []);
        }
      } catch (err) {
        console.error("Failed to load cache data:", err);
        setError("캐시 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCacheData();
  }, []);

  if (isLoading && dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">캐시 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 검색분석 리포트</h1>
          <p className="text-sm text-gray-500 mt-1">
            캠페인별 기간 비교 및 AI 인사이트
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          <Database className="w-3 h-3" />
          캐시 데이터
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 전체 광고 데이터 안내 */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
        <Database className="w-4 h-4" />
        전체 네이버 광고 데이터 기준 분석
      </div>

      {/* 기간 프리셋 탭 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setPreset("weekly")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              preset === "weekly"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            주간 (이번주 vs 지난주)
          </button>
          <button
            onClick={() => setPreset("monthly")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              preset === "monthly"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            월간 (이번달 vs 지난달)
          </button>
          <button
            onClick={() => setPreset("custom")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              preset === "custom"
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            직접 설정
          </button>
        </div>

        {/* 커스텀 날짜 선택 */}
        {preset === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                기준 기간
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customCurrentStart}
                  onChange={(e) => setCustomCurrentStart(e.target.value)}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="date"
                  value={customCurrentEnd}
                  onChange={(e) => setCustomCurrentEnd(e.target.value)}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                비교 기간
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customPreviousStart}
                  onChange={(e) => setCustomPreviousStart(e.target.value)}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="date"
                  value={customPreviousEnd}
                  onChange={(e) => setCustomPreviousEnd(e.target.value)}
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 기간 정보 배너 */}
      {currentPeriod && previousPeriod && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-blue-100">
                {preset === "weekly" ? "주간" : preset === "monthly" ? "월간" : "커스텀"} 비교
              </p>
              <p className="text-lg font-semibold mt-1">
                {currentPeriod.startDate} ~ {currentPeriod.endDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">비교 대상</p>
              <p className="text-sm mt-1">
                {previousPeriod.startDate} ~ {previousPeriod.endDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 비교 카드 */}
      {currentPeriod && previousPeriod && changes && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <ComparisonCard
            label="노출수"
            icon={Eye}
            current={currentPeriod.impressions}
            previous={previousPeriod.impressions}
            changeRate={changes.impressions}
          />
          <ComparisonCard
            label="클릭수"
            icon={MousePointer}
            current={currentPeriod.clicks}
            previous={previousPeriod.clicks}
            changeRate={changes.clicks}
          />
          <ComparisonCard
            label="광고비"
            icon={Wallet}
            current={currentPeriod.cost}
            previous={previousPeriod.cost}
            changeRate={changes.cost}
            isCurrency
          />
          <ComparisonCard
            label="CTR"
            icon={TrendingUp}
            current={currentPeriod.ctr}
            previous={previousPeriod.ctr}
            changeRate={changes.ctr}
            isPercent
          />
          <ComparisonCard
            label="CPC"
            icon={Target}
            current={currentPeriod.cpc}
            previous={previousPeriod.cpc}
            changeRate={changes.cpc}
            isCurrency
            isInverse
          />
        </div>
      )}

      {/* 데이터 없음 메시지 */}
      {!currentPeriod && !isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">
            선택한 기간에 캐시된 데이터가 없습니다.
            {preset === "custom" && " 다른 날짜를 선택하거나"} 백필 스크립트를 실행하여 데이터를 동기화해주세요.
          </p>
          <code className="block mt-2 text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
            node scripts/backfill-naver-ad.js
          </code>
        </div>
      )}

      {/* AI 인사이트 */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">AI 인사이트</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* 키워드 분석 */}
      {keywordAnalysis.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">키워드 성과 분석 (월간)</h2>
          <p className="text-sm text-gray-500 -mt-2">이번달 vs 지난달 비교</p>

          {/* 성과 급상승 키워드 */}
          <KeywordTable keywords={topGainers} title="성과 급상승 키워드" type="gainers" />

          {/* 주의 필요 키워드 */}
          <KeywordTable keywords={topLosers} title="주의 필요 키워드" type="losers" />

          {/* 전체 키워드 */}
          <KeywordTable
            keywords={keywordAnalysis.slice(0, 20)}
            title="키워드 TOP 20 (클릭순)"
            type="all"
          />
        </div>
      )}
    </div>
  );
}
