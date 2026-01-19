import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'VIBE 치과 경영 분석 시스템',
  description: '치과 경영을 위한 통합 분석 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
