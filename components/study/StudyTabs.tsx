"use client";

import { useState } from "react";
import type { ChapterMeta } from "@/data/chapters";
import type { Verse } from "@/data/revelation";
import type { SilsangEntry } from "@/data/silsang";
import PictureGenerator from "@/components/study/PictureGenerator";

type Tab = "title" | "summary" | "picture" | "silsang" | "text";

export default function StudyTabs({
  chapter,
  titleEntries,
  verses,
  relatedSilsang,
}: {
  chapter: number;
  titleEntries: ChapterMeta[];
  verses: Verse[];
  relatedSilsang: SilsangEntry[];
}) {
  const [tab, setTab] = useState<Tab>("title");
  const [revealed, setRevealed] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: "title", label: "① 제목" },
    { id: "summary", label: "② 요약" },
    { id: "picture", label: "③ 그림" },
    { id: "silsang", label: "④ 실상" },
    { id: "text", label: "⑤ 본문" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setRevealed(false);
            }}
            className={`px-4 py-3 text-sm whitespace-nowrap font-medium transition border-b-2 ${
              tab === t.id
                ? "border-sky-700 text-sky-800 bg-sky-50"
                : "border-transparent text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {tab === "title" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">버튼을 눌러 제목을 떠올려본 뒤 확인하세요.</p>
            {titleEntries.map((t, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs text-sky-700 font-semibold">
                  계 {t.range ?? `${t.chapter}장`}
                </div>
                <div className="mt-2 min-h-[2rem] text-lg font-semibold">
                  {revealed ? t.title : <span className="text-slate-300">?? ?? ??</span>}
                </div>
              </div>
            ))}
            <button
              onClick={() => setRevealed((v) => !v)}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-700"
            >
              {revealed ? "다시 가리기" : "제목 보기"}
            </button>
          </div>
        )}

        {tab === "summary" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              이 장의 요약은 직접 입력해서 채워주세요. (다음 업데이트에서 편집 기능 제공)
            </p>
            <div className="rounded-lg bg-slate-50 border border-dashed border-slate-300 p-6 text-slate-500 text-sm">
              아직 요약이 없습니다. 본인 강의/필기 기준으로 채워 넣을 영역입니다.
            </div>
          </div>
        )}

        {tab === "picture" && (
          <PictureGenerator chapter={chapter} verses={verses} />
        )}

        {tab === "silsang" && (
          <div className="space-y-3">
            {relatedSilsang.length === 0 ? (
              <p className="text-sm text-slate-500">이 장에 해당하는 프리셋 실상이 아직 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {relatedSilsang.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-slate-200 p-3 grid sm:grid-cols-[1fr_auto_2fr] sm:items-center gap-2"
                  >
                    <span className="font-medium">{s.parable}</span>
                    <span className="text-sky-700 hidden sm:block">→</span>
                    <span className="text-slate-700">
                      {revealed ? s.silsang : <span className="text-slate-300">?? ?? ??</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {relatedSilsang.length > 0 && (
              <button
                onClick={() => setRevealed((v) => !v)}
                className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-700"
              >
                {revealed ? "다시 가리기" : "실상 보기"}
              </button>
            )}
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {verses.map((v) => (
              <p key={v.verse} className="leading-relaxed">
                <span className="text-xs text-sky-700 font-semibold mr-2">{v.verse}</span>
                {v.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
