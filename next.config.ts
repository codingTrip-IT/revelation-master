import type { NextConfig } from "next";

// GitHub Pages: https://codingTrip-IT.github.io/revelation-master/
// 빌드 시 BASE_PATH 환경변수가 있으면 사용, 없으면 빈 문자열 (로컬 dev 그대로)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // GitHub Pages 호환을 위해 모든 경로에 trailing slash
  trailingSlash: true,
  images: {
    // 외부 이미지 최적화 서버를 못 쓰므로 끔
    unoptimized: true,
  },
};

export default nextConfig;
