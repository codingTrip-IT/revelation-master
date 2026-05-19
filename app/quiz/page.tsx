import Link from "next/link";
import { QUIZZES } from "@/data/quizzes";

export default function QuizIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">빈칸 문제</h1>
      <p className="text-slate-600 text-sm mb-6">
        각 단락별로 핵심 어구가 빈칸으로 출제됩니다. 성경 본문 그대로 정확히 입력하세요.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {QUIZZES.map((q) => (
          <li key={q.id}>
            <Link
              href={`/quiz/${q.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-400 hover:shadow-sm transition"
            >
              <div className="text-xs text-sky-700 font-semibold">계 {q.range}</div>
              <div className="mt-1 font-medium leading-snug">{q.title}</div>
              <div className="mt-2 text-xs text-slate-500">
                {q.verses.length}절 · 빈칸{" "}
                {q.verses.reduce(
                  (n, v) => n + v.segments.filter((s) => s.kind === "blank").length,
                  0
                )}
                개
              </div>
            </Link>
          </li>
        ))}
        {QUIZZES.length === 0 && (
          <li className="text-sm text-slate-500">아직 등록된 문제가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
