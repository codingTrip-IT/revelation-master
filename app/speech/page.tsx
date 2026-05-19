import Link from "next/link";
import { SPEECH_SECTIONS } from "@/data/speech";

const GROUP_ORDER = ["서론", "개요", "본문", "핵심", "단락"] as const;
const GROUP_DESC: Record<(typeof GROUP_ORDER)[number], string> = {
  서론: "전체 흐름 잡기",
  개요: "계시록 전체 소개",
  본문: "절별 풀이 (1:1 ~ 1:3)",
  핵심: "1:1~8 요약",
  단락: "1:4~8 단락별 (나라와 제사장 / 구름 / 알파와 오메가)",
};

export default function SpeechIndex() {
  const grouped = new Map<string, typeof SPEECH_SECTIONS>();
  for (const s of SPEECH_SECTIONS) {
    const arr = grouped.get(s.group) ?? [];
    arr.push(s);
    grouped.set(s.group, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">스피치</h1>
        <p className="text-slate-600 text-sm mt-1">
          원문과 풀어서 말하는 버전을 함께 보고, 음성으로 들으며 흐름을 잡습니다.
          (다 외우려 하지 말고, 연결만 익혀 두세요.)
        </p>
      </div>
      {GROUP_ORDER.map((g) => {
        const list = grouped.get(g);
        if (!list?.length) return null;
        return (
          <section key={g}>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-lg font-semibold">{g}</h2>
              <span className="text-xs text-slate-500">{GROUP_DESC[g]}</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {list.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/speech/${s.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-400 hover:shadow-sm transition"
                  >
                    {s.range && (
                      <div className="text-xs text-sky-700 font-semibold">{s.range}</div>
                    )}
                    <div className="mt-1 font-medium leading-snug">{s.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
