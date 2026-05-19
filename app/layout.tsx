import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "계시록 마스터",
  description: "개역한글 기준 요한계시록 공부 + 암송 + 실상 마스터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto max-w-4xl flex items-center justify-between p-4">
            <Link href="/" className="font-bold text-lg tracking-tight">
              📖 계시록 마스터
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/study" className="hover:text-sky-700">공부</Link>
              <Link href="/quiz" className="hover:text-sky-700">암기</Link>
              <Link href="/speech" className="hover:text-sky-700">스피치</Link>
              <Link href="/silsang" className="hover:text-sky-700">실상</Link>
              <Link href="/exam" className="hover:text-sky-700">시험</Link>
              <Link href="/notes" className="hover:text-sky-700">오답노트</Link>
              <Link href="/settings" className="hover:text-sky-700 text-slate-500">⚙</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white text-center text-xs text-slate-500 p-3">
          개역한글판 · 로컬 저장 · v0.1
        </footer>
      </body>
    </html>
  );
}
