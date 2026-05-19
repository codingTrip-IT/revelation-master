import Link from "next/link";
import { EXAMS } from "@/data/exams";

export default function ExamIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">시험 대비</h1>
      <p className="text-slate-600 text-sm mb-6">
        절 본문 안의 핵심 어구에 ①②③ 번호가 매겨져 있고, 아래에 풀이가 정리돼 있습니다.
        ‘주석 가리기’로 자가 점검하세요.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {EXAMS.map((e) => {
          const annoCount = e.verses.reduce((n, v) => n + v.annotations.length, 0);
          return (
            <li key={e.id}>
              <Link
                href={`/exam/${e.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-400 hover:shadow-sm transition"
              >
                <div className="text-xs text-sky-700 font-semibold">계 {e.chapter}장</div>
                <div className="mt-1 font-medium leading-snug">{e.title}</div>
                <div className="mt-2 text-xs text-slate-500">
                  {e.verses.length}절 · 주석 {annoCount}개
                </div>
              </Link>
            </li>
          );
        })}
        {EXAMS.length === 0 && (
          <li className="text-sm text-slate-500">등록된 시험 자료가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
