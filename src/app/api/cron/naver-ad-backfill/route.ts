import { NextResponse } from "next/server";
import { getCampaigns, getSingleDayStats, DailyStatRecord } from "@/lib/naver-searchad";
import { sendTelegramMessage, CHAT_IDS } from "@/lib/telegram";
import { saveNaverAdDaily } from "@/lib/analytics-airtable";
import { d1Query } from "@/lib/d1";

// Vercel Cron 설정
export const maxDuration = 60; // 최대 60초

// 기존 저장된 날짜 확인 (D1)
async function getExistingDates(): Promise<Set<string>> {
  try {
    const rows = await d1Query<{ date: string }>(`SELECT DISTINCT date FROM naver_ad_daily`);
    return new Set(rows.map((r) => r.date));
  } catch {
    return new Set();
  }
}

// 레코드 저장 (D1 upsert)
async function saveRecords(records: DailyStatRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  await saveNaverAdDaily(
    records.map((r) => ({
      date: r.date,
      impCnt: r.impCnt,
      clkCnt: r.clkCnt,
      salesAmt: r.salesAmt,
      ctr: r.ctr,
      cpc: r.cpc,
      ccnt: r.ccnt,
    }))
  );
  return records.length;
}

// 날짜 형식 헬퍼
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  // Cron 인증 확인
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log("Cron auth warning: invalid or missing token");
  }

  const startTime = Date.now();

  try {
    // 1. 캠페인 목록 조회
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No campaigns found",
        saved: 0,
      });
    }

    const campaignIds = campaigns.map((c) => c.nccCampaignId);

    // 2. 기존 저장된 날짜 확인
    const existingDates = await getExistingDates();

    // 3. 최근 7일 중 누락된 날짜 확인
    const today = new Date();
    const missingDates: string[] = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      if (!existingDates.has(dateStr)) {
        missingDates.push(dateStr);
      }
    }

    if (missingDates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All recent data already synced",
        saved: 0,
      });
    }

    // 4. 누락된 날짜 데이터 조회 및 저장
    const recordsToSave: DailyStatRecord[] = [];

    for (const date of missingDates) {
      const stat = await getSingleDayStats(campaignIds, date);
      if (stat && (stat.impCnt > 0 || stat.clkCnt > 0 || stat.salesAmt > 0)) {
        recordsToSave.push(stat);
      }
      // Rate limit 방지
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const savedCount = await saveRecords(recordsToSave);

    const duration = Date.now() - startTime;

    // 텔레그램 알림 (성공 시)
    if (savedCount > 0) {
      await sendTelegramMessage({
        chatId: CHAT_IDS.BACKFILL_ALERT,
        message: `✅ <b>[초호] 네이버 광고 데이터 백필 완료</b>\n\n저장된 날짜: ${savedCount}일\n실행 시간: ${(duration / 1000).toFixed(1)}초`,
        parseMode: "HTML",
      });
    }

    return NextResponse.json({
      success: true,
      checked: missingDates,
      saved: savedCount,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error("Naver Ad backfill error:", error);

    // 텔레그램 알림 (실패 시)
    await sendTelegramMessage({
      chatId: CHAT_IDS.BACKFILL_ALERT,
      message: `❌ <b>[초호] 네이버 광고 데이터 백필 실패</b>\n\n오류: ${String(error)}`,
      parseMode: "HTML",
    });

    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
