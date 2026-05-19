import Link from "next/link";
import { CHAPTERS } from "@/data/chapters";

export default function StudyIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">공부 모드</h1>
      <p className="text-slate-600 mb-6 text-sm">
        장 제목 → 요약 → 그림 이해 → 실상 매핑 순서로 학습합니다.
      </p>
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
    </div>
  );
}
