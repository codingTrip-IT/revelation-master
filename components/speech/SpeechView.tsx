"use client";

import { useEffect, useState } from "react";
import type { SpeechSection } from "@/data/speech";
import { speak, speechSupported, stopSpeaking } from "@/lib/speech";

type Tab = "outline" | "narrative" | "both";

export default function SpeechView({ section }: { section: SpeechSection }) {
  const [tab, setTab] = useState<Tab>("both");
  const [rate, setRate] = useState(1.0);
  const [playing, setPlaying] = useState<null | "outline" | "narrative">(null);
  const [ttsAvail, setTtsAvail] = useState(false);

  useEffect(() => {
    setTtsAvail(speechSupported());
    return () => stopSpeaking();
  }, []);

  function play(which: "outline" | "narrative") {
    if (!ttsAvail) return;
    stopSpeaking();
    setPlaying(which);
    const text = which === "outline" ? section.outline : section.narrative;
    speak(text, { rate, onEnd: () => setPlaying(null) });
  }

  function stop() {
    stopSpeaking();
    setPlaying(null);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "outline", label: "📋 원문" },
    { id: "narrative", label: "🗣 풀어서" },
    { id: "both", label: "⬌ 나란히" },
  ];

  return (
    <div className="space-y-3">
      {/* 컨트롤 바 */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 text-xs">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-3 py-1.5 transition ${
                tab === t.id
                  ? "bg-sky-700 border-sky-700 text-white"
                  : "bg-white border-slate-300 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <label className="flex items-center gap-2">
            속도
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.05}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="accent-sky-700"
            />
            <span className="tabular-nums w-10 text-right">{rate.toFixed(2)}x</span>
          </label>
          {playing && (
            <button
              onClick={stop}
              className="rounded border border-red-300 text-red-700 px-2 py-1 hover:bg-red-50"
            >
              ⏹ 정지
            </button>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div
        className={
          tab === "both"
            ? "grid gap-3 lg:grid-cols-2"
            : "grid gap-3"
        }
      >
        {(tab === "outline" || tab === "both") && (
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <header className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sky-800">📋 원문</h2>
              <button
                onClick={() => (playing === "outline" ? stop() : play("outline"))}
                disabled={!ttsAvail}
                className={`text-xs rounded-full border px-3 py-1.5 transition ${
                  playing === "outline"
                    ? "border-sky-600 bg-sky-50 text-sky-800 animate-pulse"
                    : "border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                }`}
              >
                {playing === "outline" ? "🔊 재생 중…" : "🔊 듣기"}
              </button>
            </header>
            <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-slate-800">
              {section.outline}
            </pre>
          </article>
        )}

        {(tab === "narrative" || tab === "both") && (
          <article className="rounded-2xl border border-slate-200 bg-sky-50/40 p-5">
            <header className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sky-800">🗣 풀어서 말하는 버전</h2>
              <button
                onClick={() => (playing === "narrative" ? stop() : play("narrative"))}
                disabled={!ttsAvail}
                className={`text-xs rounded-full border px-3 py-1.5 transition ${
                  playing === "narrative"
                    ? "border-sky-600 bg-white text-sky-800 animate-pulse"
                    : "border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
                }`}
              >
                {playing === "narrative" ? "🔊 재생 중…" : "🔊 듣기"}
              </button>
            </header>
            <div className="space-y-3 text-[16px] leading-loose text-slate-800">
              {section.narrative.split(/\n\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </article>
        )}
      </div>

      {!ttsAvail && (
        <p className="text-xs text-amber-600">
          ⚠️ 이 브라우저는 음성 합성을 지원하지 않습니다. Chrome/Safari 권장.
        </p>
      )}
    </div>
  );
}
