import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 로컬 네트워크(Wi-Fi)의 다른 기기(핸드폰 등)에서 개발 서버(dev server)에 접속해 테스트할 수 있도록 허용합니다.
  // PC의 Wi-Fi IP가 바뀌면(`npm run dev` 실행 로그의 "Network:" 주소 확인) 이 목록도 함께 갱신해야 합니다.
  allowedDevOrigins: ["192.168.30.85"],
  // pdfkit은 실행 시점에 node_modules 안의 폰트 데이터 파일(.afm)을 상대 경로로 직접 읽는데,
  // Next.js 번들링 대상에 포함되면 이 파일들이 빌드 결과물에 누락되어 ENOENT 에러가 남.
  // 번들링하지 않고 실제 node_modules에서 그대로 require하도록 제외 처리.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
