import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 로컬 네트워크(Wi-Fi)의 다른 기기(핸드폰 등)에서 개발 서버(dev server)에 접속해 테스트할 수 있도록 허용합니다.
  // PC의 Wi-Fi IP가 바뀌면(`npm run dev` 실행 로그의 "Network:" 주소 확인) 이 목록도 함께 갱신해야 합니다.
  allowedDevOrigins: ["192.168.30.85"],
};

export default nextConfig;
