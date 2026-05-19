import Link from "next/link";
import { CHAPTERS } from "@/data/chapters";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-sky-50 to-slate-100 p-6 sm:p-8 border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          요한계시록을 마스터하기
        </h1>
        <p className="text-slate-600 mt-2">
          개역한글 기준 · 22장 제목 → 요약 → 그림 이해 → 빈칸 암송 → 실상까지.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/study/1"
            className="rounded-lg bg-sky-700 text-white px-4 py-2 text-sm font-medium hover:bg-sky-800"
          >
            공부 시작
          </Link>
          <Link
            href="/quiz"
            className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            암기 (빈칸)
          </Link>
          <Link
            href="/silsang"
            className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            실상 카드
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">22장 개요</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CHAPTERS.map((c, i) => (
            <li key={`${c.chapter}-${i}`}>
              <Link
                href={`/study/${c.chapter}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-400 hover:shadow-sm transition"
              >
                <div className="text-xs text-sky-700 font-semibold">
                  계 {c.range ?? `${c.chapter}장`}
                </div>
                <div className="mt-1 font-medium leading-snug">{c.title}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
