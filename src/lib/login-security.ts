// 로그인 무차별 대입(brute force) 방어 설정.
// User.failedLoginAttempts / User.lockedUntil과 함께 src/auth.ts의 authorize에서 사용.
export const MAX_LOGIN_ATTEMPTS = 5; // 이 횟수만큼 연속으로 틀리면 잠금
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 잠금 유지 시간 (15분)
