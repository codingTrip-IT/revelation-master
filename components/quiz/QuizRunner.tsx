"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Quiz, QuizVerse, Segment } from "@/data/quizzes";
import { isCorrect } from "@/lib/blank";
import { addAttempt } from "@/lib/storage";
import {
  listen,
  recognitionSupported,
  speak,
  speechSupported,
  stopSpeaking,
  containsAnswer,
  type ListenHandle,
} from "@/lib/speech";

const CIRCLED = [
  "①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩",
  "⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳",
  "㉑","㉒","㉓","㉔","㉕","㉖","㉗","㉘","㉙","㉚",
];
const circled = (n: number) => CIRCLED[n - 1] ?? `(${n})`;

type Mode = "view" | "answer";

// 절을 정답 채운 자연스러운 문장으로 변환 (TTS용)
function buildVerseText(v: QuizVerse): string {
  return v.segments
    .map((s) => (s.kind === "text" ? s.text : s.answer))
    .join("")
    .trim();
}

export default function QuizRunner({ quiz }: { quiz: Quiz }) {
  const blanks = useMemo(
    () =>
      quiz.verses.flatMap((v) =>
        v.segments.filter((s): s is Extract<Segment, { kind: "blank" }> => s.kind === "blank")
      ),
    [quiz]
  );

  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [graded, setGraded] = useState<null | Record<number, boolean>>(null);
  const [mode, setMode] = useState<Mode>("answer");
  const [rate, setRate] = useState(0.95);
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null);
  const [listeningVerse, setListeningVerse] = useState<number | null>(null);
  const [listenHandle, setListenHandle] = useState<ListenHandle | null>(null);
  const [interim, setInterim] = useState<string>("");
  const [ttsAvail, setTtsAvail] = useState(false);
  const [sttAvail, setSttAvail] = useState(false);

  useEffect(() => {
    setTtsAvail(speechSupported());
    setSttAvail(recognitionSupported());
    return () => {
      stopSpeaking();
      listenHandle?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function check() {
    const r: Record<number, boolean> = {};
    for (const b of blanks) {
      const v = inputs[b.num] ?? "";
      r[b.num] = isCorrect(v, b.answer) || (b.alts ?? []).some((a) => isCorrect(v, a));
    }
    setGraded(r);

    try {
      const byVerse = new Map<number, { total: number; missed: string[] }>();
      for (const verse of quiz.verses) {
        const entry = { total: 0, missed: [] as string[] };
        for (const s of verse.segments) {
          if (s.kind === "blank") {
            entry.total++;
            if (!r[s.num]) entry.missed.push(s.answer);
          }
        }
        byVerse.set(verse.verse, entry);
      }
      for (const [verseNum, entry] of byVerse) {
        if (entry.total === 0) continue;
        addAttempt({
          chapter: quiz.chapter,
          verse: verseNum,
          mode: "blank",
          correct: entry.missed.length === 0,
          missedWords: entry.missed,
          total: entry.total,
        });
      }
    } catch {
      /* SSR or no IDB */
    }
  }

  function reset() {
    setInputs({});
    setGraded(null);
  }

  function speakVerse(v: QuizVerse) {
    if (!ttsAvail) return;
    stopSpeaking();
    setSpeakingVerse(v.verse);
    speak(buildVerseText(v), {
      rate,
      onEnd: () => setSpeakingVerse(null),
    });
  }

  function speakAll() {
    if (!ttsAvail) return;
    stopSpeaking();
    const text = quiz.verses.map((v) => buildVerseText(v)).join(" ");
    setSpeakingVerse(-1);
    speak(text, { rate, onEnd: () => setSpeakingVerse(null) });
  }

  function stopAll() {
    stopSpeaking();
    setSpeakingVerse(null);
    listenHandle?.stop();
  }

  // 절 단위로 받아쓰기: 인식된 텍스트에서 해당 절의 정답 어구를 찾아 자동 채움
  function listenForVerse(v: QuizVerse) {
    if (!sttAvail) return;
    if (listeningVerse !== null) {
      listenHandle?.stop();
      return;
    }
    setInterim("");
    setListeningVerse(v.verse);
    const verseBlanks = v.segments.filter(
      (s): s is Extract<Segment, { kind: "blank" }> => s.kind === "blank"
    );

    const handle = listen(
      (text, isFinal) => {
        setInterim(text);
        // 실시간으로 매칭되는 빈칸 채워주기
        setInputs((prev) => {
          const next = { ...prev };
          for (const b of verseBlanks) {
            const candidates = [b.answer, ...(b.alts ?? [])];
            for (const ans of candidates) {
              if (containsAnswer(text, ans)) {
                next[b.num] = b.answer; // 정답으로 채움
                break;
              }
            }
          }
          return next;
        });
        if (isFinal) {
          // 약간의 시간 후 종료 표시
        }
      },
      {
        onEnd: () => {
          setListeningVerse(null);
          setListenHandle(null);
          setInterim("");
        },
        onError: () => {
          setListeningVerse(null);
          setListenHandle(null);
          setInterim("");
        },
      }
    );
    setListenHandle(handle);
  }

  const totalCorrect = graded ? Object.values(graded).filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">빈칸 문제 · 계 {quiz.range}</div>
          <h1 className="text-2xl font-bold mt-1">{quiz.title}</h1>
        </div>
        <Link href="/quiz" className="text-sm text-sky-700 hover:underline shrink-0">
          ← 목록
        </Link>
      </div>

      {/* 컨트롤 바 */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm text-slate-600">
            빈칸 <span className="font-semibold text-slate-900">{blanks.length}</span>개
            {graded && (
              <>
                {" · "}
                <span
                  className={
                    totalCorrect === blanks.length ? "text-emerald-700" : "text-sky-700"
                  }
                >
                  맞춤 {totalCorrect}/{blanks.length}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-1 text-xs flex-wrap">
            <button
              onClick={() => setMode(mode === "view" ? "answer" : "view")}
              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
            >
              {mode === "view" ? "✏️ 입력 모드" : "👁 정답 보기"}
            </button>
            <button
              onClick={speakAll}
              disabled={!ttsAvail}
              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50 disabled:opacity-40"
              title={ttsAvail ? "전체를 음성으로 듣기" : "이 브라우저는 TTS 미지원"}
            >
              🔊 전체 듣기
            </button>
            {(speakingVerse !== null || listeningVerse !== null) && (
              <button
                onClick={stopAll}
                className="rounded border border-red-300 text-red-700 px-2 py-1 hover:bg-red-50"
              >
                ⏹ 정지
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <label className="flex items-center gap-2">
            속도
            <input
              type="range"
              min={0.6}
              max={1.3}
              step={0.05}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="accent-sky-700"
            />
            <span className="tabular-nums w-10 text-right">{rate.toFixed(2)}x</span>
          </label>
          {!sttAvail && (
            <span className="ml-auto text-amber-600">
              ⚠️ 받아쓰기는 Chrome/엣지(데스크탑·안드로이드)에서 동작합니다.
            </span>
          )}
        </div>
      </div>

      <ol className="space-y-5">
        {quiz.verses.map((v) => {
          const isSpeaking = speakingVerse === v.verse;
          const isListening = listeningVerse === v.verse;
          return (
            <li key={v.verse} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-sky-700 font-semibold">
                  계 {quiz.chapter}:{v.verse}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => speakVerse(v)}
                    disabled={!ttsAvail}
                    className={`text-xs rounded-full border px-2 py-1 transition ${
                      isSpeaking
                        ? "border-sky-600 bg-sky-50 text-sky-800 animate-pulse"
                        : "border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                    }`}
                    title="이 절 듣기"
                  >
                    🔊 듣기
                  </button>
                  <button
                    onClick={() => listenForVerse(v)}
                    disabled={!sttAvail}
                    className={`text-xs rounded-full border px-2 py-1 transition ${
                      isListening
                        ? "border-red-500 bg-red-50 text-red-700 animate-pulse"
                        : "border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                    }`}
                    title={sttAvail ? "이 절을 읊으면 빈칸 자동 채움" : "음성인식 미지원"}
                  >
                    {isListening ? "🎤 듣는 중…" : "🎤 받아쓰기"}
                  </button>
                </div>
              </div>
              <p className="leading-loose text-[17px]">
                {v.segments.map((s, i) =>
                  s.kind === "text" ? (
                    <span key={i}>{s.text}</span>
                  ) : (
                    <BlankSpan
                      key={i}
                      seg={s}
                      value={inputs[s.num] ?? ""}
                      onChange={(val) =>
                        setInputs((prev) => ({ ...prev, [s.num]: val }))
                      }
                      graded={graded ? graded[s.num] : undefined}
                      mode={mode}
                    />
                  )
                )}
              </p>
              {isListening && interim && (
                <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded p-2 border border-slate-200">
                  🎙 인식: <span className="text-slate-800">{interim}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-2 flex gap-2 justify-end">
        <button
          onClick={reset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          초기화
        </button>
        <button
          onClick={check}
          className="rounded-lg bg-sky-700 text-white px-5 py-2 text-sm font-medium hover:bg-sky-800 shadow"
        >
          채점하기
        </button>
      </div>

      {graded && totalCorrect < blanks.length && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm">
          <div className="font-semibold text-red-800 mb-2">
            틀린 빈칸 {blanks.length - totalCorrect}개
          </div>
          <ul className="space-y-1 text-red-900">
            {blanks
              .filter((b) => !graded[b.num])
              .map((b) => (
                <li key={b.num}>
                  <span className="font-semibold">{circled(b.num)}</span>{" "}
                  <span className="text-red-700">{b.answer}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      {graded && totalCorrect === blanks.length && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          ✅ 모두 정답! ({blanks.length}/{blanks.length})
        </div>
      )}
    </div>
  );
}

function BlankSpan({
  seg,
  value,
  onChange,
  graded,
  mode,
}: {
  seg: Extract<Segment, { kind: "blank" }>;
  value: string;
  onChange: (v: string) => void;
  graded?: boolean;
  mode: Mode;
}) {
  const width = Math.max(seg.answer.length, 4) + 2;
  const showAnswer = mode === "view";
  const isWrong = graded === false;
  const isRight = graded === true;

  return (
    <span className="inline-flex items-baseline whitespace-nowrap mx-0.5 align-baseline">
      <span className="text-sky-700 font-semibold text-sm mr-0.5">{circled(seg.num)}</span>
      {showAnswer ? (
        <span className="border-b-2 border-sky-400 text-sky-800 font-medium px-1">
          {seg.answer}
        </span>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          className={`inline-block align-baseline border-b-2 px-1 text-center outline-none bg-transparent transition ${
            isWrong
              ? "border-red-500 text-red-700"
              : isRight
              ? "border-emerald-500 text-emerald-700"
              : "border-sky-400 focus:border-sky-700"
          }`}
          style={{ width: `${width}ch` }}
        />
      )}
    </span>
  );
}
