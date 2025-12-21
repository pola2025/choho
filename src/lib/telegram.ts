/**
 * 텔레그램 봇 알림 유틸리티
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// 채팅 ID 상수
export const CHAT_IDS = {
  NAVER_AD_ALERT: '-1003280236380',  // 네이버 광고 예산 알림
  BACKFILL_ALERT: '-1003394139746',  // 백필 알림
};

export interface TelegramMessage {
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

/**
 * 텔레그램 메시지 발송
 */
export async function sendTelegramMessage({
  chatId,
  message,
  parseMode = 'HTML',
}: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send telegram message:', error);
    return false;
  }
}

/**
 * 네이버 광고 예산 부족 알림
 */
export async function sendNaverAdBudgetAlert(
  currentBudget: number,
  threshold: number = 50000,
  smsSent?: boolean
): Promise<boolean> {
  if (currentBudget >= threshold) {
    return false; // 예산이 충분하면 알림 안 보냄
  }

  const smsStatus = smsSent === undefined ? '' : smsSent
    ? '\n\n📱 SMS 문자 알림 완료'
    : '\n\n⚠️ SMS 발송 실패';

  const message = `
⚠️ <b>[초호] 네이버 검색광고 예산 부족</b>

현재 잔여 예산: <b>${currentBudget.toLocaleString()}원</b>

💳 비즈머니 충전이 필요합니다!

🔗 <a href="https://searchad.naver.com">네이버 검색광고 관리</a>${smsStatus}
  `.trim();

  return sendTelegramMessage({
    chatId: CHAT_IDS.NAVER_AD_ALERT,
    message,
    parseMode: 'HTML',
  });
}

/**
 * 네이버 광고 예산 소진 알림
 */
export async function sendNaverAdBudgetDepletedAlert(
  currentBudget: number,
  smsSent?: boolean
): Promise<boolean> {
  const smsStatus = smsSent === undefined ? '' : smsSent
    ? '\n\n📱 SMS 문자 알림 완료'
    : '\n\n⚠️ SMS 발송 실패';

  const message = `
🚨 <b>[초호] 네이버 검색광고 예산 소진 임박!</b>

현재 잔여 예산: <b>${currentBudget.toLocaleString()}원</b>

광고가 곧 중단됩니다!
즉시 충전해주세요!

🔗 <a href="https://searchad.naver.com">네이버 검색광고 관리</a>${smsStatus}
  `.trim();

  return sendTelegramMessage({
    chatId: CHAT_IDS.NAVER_AD_ALERT,
    message,
    parseMode: 'HTML',
  });
}
