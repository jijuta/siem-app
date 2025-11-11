import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: 프로덕션 빌드 시 ESLint 에러 무시 (개발 중)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: 프로덕션 빌드 시 TypeScript 에러 무시 (개발 중)
    ignoreBuildErrors: true,
  },
  // Turbopack에서 외부 패키지 처리 (Next.js 15+에서 serverExternalPackages로 변경됨)
  serverExternalPackages: ['child_process'],
};

export default nextConfig;
