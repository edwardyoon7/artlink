import nodemailer from "nodemailer";
import { formatDateTimeKST } from "@/lib/format-date";

// 코칭 예약 최종 확정 안내 메일 발신 — 하이웍스 SMTP(edwardyoon7@artieum.kr) 재사용
// (2026-08-08, 별도 no-reply 발신 서비스(Resend 등) 신규 가입 대신 기존 도메인 메일함으로
// 우선 진행하기로 결정. 발송량이 늘어나 대표님 개인 받은편지함이 번잡해지면 그때 전환 검토).
const SITE_NAME = "아트이음(Artieum)";
const CONTACT_EMAIL = "edwardyoon7@artieum.kr";

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true, // 465 포트는 SSL/TLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// SMTP 미설정(로컬 개발 환경 등)이거나 발송 자체가 실패해도 예외를 던지지 않는다 — 메일
// 발송은 예약 확정이라는 핵심 동작을 막아서는 안 되는 부가 기능(best-effort)이기 때문.
async function sendMail(options: { to: string; subject: string; text: string }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      `[mailer] SMTP_* 환경변수가 설정되지 않아 메일 발송을 건너뜁니다: "${options.subject}" → ${options.to}`,
    );
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_USER}>`,
      ...options,
    });
  } catch (error) {
    console.error(`[mailer] 메일 발송 실패: "${options.subject}" → ${options.to}`, error);
  }
}

export type CoachingConfirmationInfo = {
  applicantEmail: string;
  applicantName: string;
  instructorEmail: string | null;
  instructorName: string;
  curriculum: string;
  region: string | null;
  preferredDate: Date;
  durationHours: number;
};

export async function sendCoachingConfirmationEmails(info: CoachingConfirmationInfo) {
  const dateLabel = formatDateTimeKST(info.preferredDate);
  const regionLabel = info.region ?? "미지정";

  const jobs = [
    sendMail({
      to: info.applicantEmail,
      subject: `[${SITE_NAME}] 코칭 예약이 확정되었습니다`,
      text: [
        `${info.applicantName}님, 신청하신 코칭 예약이 최종 확정되었습니다.`,
        "",
        `- 담당 강사: ${info.instructorName}`,
        `- 일시: ${dateLabel} (${info.durationHours}시간)`,
        `- 지역: ${regionLabel}`,
        `- 배우고 싶은 내용: ${info.curriculum}`,
        "",
        `일정 관련 문의는 ${SITE_NAME}(${CONTACT_EMAIL})으로 연락 주십시오.`,
      ].join("\n"),
    }),
  ];

  // Instructor.email은 이 필드가 생기기 전 등록된 강사의 경우 비어 있을 수 있다
  // (schema.prisma 주석 참고) — 그런 경우 신청자에게만 발송하고 조용히 건너뛴다.
  if (info.instructorEmail) {
    jobs.push(
      sendMail({
        to: info.instructorEmail,
        subject: `[${SITE_NAME}] 담당 코칭 예약이 확정되었습니다`,
        text: [
          `${info.instructorName}님, 담당하신 코칭 예약이 최종 확정되었습니다.`,
          "",
          `- 신청자: ${info.applicantName}`,
          `- 일시: ${dateLabel} (${info.durationHours}시간)`,
          `- 지역: ${regionLabel}`,
          `- 배우고 싶은 내용: ${info.curriculum}`,
          "",
          `일정 관련 문의는 ${SITE_NAME}(${CONTACT_EMAIL})으로 연락 주십시오.`,
        ].join("\n"),
      }),
    );
  }

  await Promise.all(jobs);
}
