/**
 * 네이버 SENS (Simple & Easy Notification Service) SMS 발송
 * https://api.ncloud-docs.com/docs/ai-application-service-sens-smsv2
 */

import crypto from 'crypto';

const SENS_SERVICE_ID = process.env.NCP_SERVICE_ID || '';
const SENS_ACCESS_KEY = process.env.NCP_ACCESS_KEY || '';
const SENS_SECRET_KEY = process.env.NCP_SECRET_KEY || '';
const SENS_SENDER = process.env.NCP_SENDER_PHONE || '';  // 발신번호
const SENS_RECEIVER = process.env.NCP_PHONE_NUMBER || '';  // 수신번호

const API_URL = `https://sens.apigw.ntruss.com/sms/v2/services/${SENS_SERVICE_ID}/messages`;

// HMAC-SHA256 서명 생성
function makeSignature(timestamp: string, method: string, url: string): string {
  const space = ' ';
  const newLine = '\n';

  const message = [
    method,
    space,
    url,
    newLine,
    timestamp,
    newLine,
    SENS_ACCESS_KEY,
  ].join('');

  const hmac = crypto.createHmac('sha256', SENS_SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
}

export interface SendSMSResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

/**
 * SMS 발송
 */
export async function sendSMS(
  content: string,
  receiver?: string
): Promise<SendSMSResult> {
  if (!SENS_SERVICE_ID || !SENS_ACCESS_KEY || !SENS_SECRET_KEY || !SENS_SENDER) {
    console.error('NAVER SENS 환경변수가 설정되지 않았습니다.');
    return { success: false, error: 'SENS 환경변수 미설정' };
  }

  const targetNumber = receiver || SENS_RECEIVER;
  if (!targetNumber) {
    console.error('수신번호가 설정되지 않았습니다.');
    return { success: false, error: '수신번호 미설정' };
  }

  try {
    const timestamp = Date.now().toString();
    const method = 'POST';
    const url = `/sms/v2/services/${SENS_SERVICE_ID}/messages`;
    const signature = makeSignature(timestamp, method, url);

    // SMS 타입 결정 (80바이트 이하: SMS, 초과: LMS)
    const contentBytes = Buffer.byteLength(content, 'utf8');
    const type = contentBytes <= 80 ? 'SMS' : 'LMS';

    const body = {
      type,
      from: SENS_SENDER,
      content,
      messages: [
        {
          to: targetNumber.replace(/-/g, ''),  // 하이픈 제거
        },
      ],
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': SENS_ACCESS_KEY,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SENS SMS 발송 실패:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const result = await response.json();
    console.log('SENS SMS 발송 성공:', result.requestId);
    return { success: true, requestId: result.requestId };
  } catch (error) {
    console.error('SENS SMS 발송 에러:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 네이버 광고 예산 부족 SMS 알림
 */
export async function sendNaverAdBudgetSMS(
  currentBudget: number,
  threshold: number = 50000
): Promise<SendSMSResult> {
  if (currentBudget >= threshold) {
    return { success: false, error: '예산이 충분합니다' };
  }

  const content = `안녕하세요 사장님, 네이버 광고예산이 ${currentBudget.toLocaleString()}원 남아 충전요청 드립니다.

농협 79018881584989`;

  return sendSMS(content);
}

/**
 * 네이버 광고 예산 소진 임박 SMS 알림
 */
export async function sendNaverAdBudgetDepletedSMS(
  currentBudget: number
): Promise<SendSMSResult> {
  const content = `[긴급] 안녕하세요 사장님, 네이버 광고예산이 ${currentBudget.toLocaleString()}원 남아 충전요청 드립니다.

농협 79018881584989`;

  return sendSMS(content);
}

/**
 * SENS 연결 테스트
 */
export function testSENSConfig(): boolean {
  const hasConfig = !!(SENS_SERVICE_ID && SENS_ACCESS_KEY && SENS_SECRET_KEY && SENS_SENDER);
  if (!hasConfig) {
    console.log('SENS 설정 누락:', {
      serviceId: !!SENS_SERVICE_ID,
      accessKey: !!SENS_ACCESS_KEY,
      secretKey: !!SENS_SECRET_KEY,
      sender: !!SENS_SENDER,
    });
  }
  return hasConfig;
}
