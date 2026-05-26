"use client";

import { useMemo, useState } from "react";
import type { Exam, ExamAnnotation, ExamVerse, TestMode } from "@/data/exams";
import { verseFullText } from "@/data/exams";
import { isCorrect, normalizeAnswer } from "@/lib/blank";
import { addAttempt } from "@/lib/storage";

const chOf = (exam: Exam, v: ExamVerse) => v.chapter ?? exam.chapter;

const CIRCLED = [
  "①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩",
  "⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳",
];
const circled = (n: number) => CIRCLED[n - 1] ?? `(${n})`;
const keyOf = (v: number, n: number) => `${v}-${n}`;

type Mode = "all" | "byVerse" | "title" | "blank" | "anno" | "fullText";

const MODES: {
  id: Mode;
  label: string;
  desc: string;
  group: "보기" | "시험";
  testMode?: TestMode;
}[] = [
  { id: "all", label: "📖 전체 보기", desc: "본문 + 주석 모두 펼침", group: "보기" },
  {
    id: "byVerse",
    label: "📚 절마다 공부하기",
    desc: "한 절씩 보고, 가리고, 시험까지",
    group: "보기",
  },
  {
    id: "title",
    label: "🏷 제목 시험",
    desc: "장 제목을 정확히 쓰기",
    group: "시험",
    testMode: "title",
  },
  {
    id: "blank",
    label: "📝 빈칸 시험",
    desc: "본문 안 핵심 어구 직접 입력",
    group: "시험",
    testMode: "blank",
  },
  {
    id: "anno",
    label: "🧾 주석 시험",
    desc: "각 번호의 의미를 떠올리고 자가 채점",
    group: "시험",
    testMode: "anno",
  },
  {
    id: "fullText",
    label: "✍️ 전문 쓰기",
    desc: "절 전체 본문을 그대로 입력",
    group: "시험",
    testMode: "fullText",
  },
];

export default function ExamView({ exam }: { exam: Exam }) {
  const visibleModes = useMemo(() => {
    const allowed = exam.testModes;
    return MODES.filter((m) => {
      if (m.group === "보기") return true;
      if (!m.testMode) return true;
      if (!allowed) return m.id !== "fullText"; // 기본: fullText는 명시적으로 활성화한 시험에만
      return allowed.includes(m.testMode);
    });
  }, [exam.testModes]);

  // 기본 모드: fullTextMode 면 fullText, 아니면 전체 보기
  const [mode, setMode] = useState<Mode>(exam.fullTextMode ? "fullText" : "all");

  return (
    <div className="space-y-4">
      <ModeBar visibleModes={visibleModes} mode={mode} setMode={setMode} />

      {mode === "all" && <FullView exam={exam} />}
      {mode === "byVerse" && <ByVerseStudy exam={exam} />}
      {mode === "title" && <TitleQuiz exam={exam} />}
      {mode === "blank" && <BlankQuiz exam={exam} />}
      {mode === "anno" && <AnnotationQuiz exam={exam} />}
      {mode === "fullText" && <FullTextQuiz exam={exam} />}
    </div>
  );
}

function ModeBar({
  visibleModes,
  mode,
  setMode,
}: {
  visibleModes: typeof MODES;
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const current = visibleModes.find((m) => m.id === mode);
  const view = visibleModes.filter((m) => m.group === "보기");
  const test = visibleModes.filter((m) => m.group === "시험");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {view.length > 0 && (
          <>
            <span className="text-xs text-slate-500 mr-1">보기</span>
            {view.map((m) => (
              <ModeButton key={m.id} m={m} mode={mode} setMode={setMode} />
            ))}
          </>
        )}
        {view.length > 0 && test.length > 0 && (
          <span className="text-xs text-slate-500 mx-1">|</span>
        )}
        {test.length > 0 && (
          <>
            <span className="text-xs text-slate-500 mr-1">시험</span>
            {test.map((m) => (
              <ModeButton key={m.id} m={m} mode={mode} setMode={setMode} />
            ))}
          </>
        )}
      </div>
      {current && <div className="text-xs text-slate-500">{current.desc}</div>}
    </div>
  );
}
function ModeButton({
  m,
  mode,
  setMode,
}: {
  m: (typeof MODES)[number];
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const active = mode === m.id;
  return (
    <button
      onClick={() => setMode(m.id)}
      className={`text-xs rounded-full border px-3 py-1.5 transition ${
        active
          ? "bg-sky-700 border-sky-700 text-white"
          : "bg-white border-slate-300 hover:bg-slate-50"
      }`}
    >
      {m.label}
    </button>
  );
}

/* ─────────────────────────────── 보기 ─────────────────────────────── */
/* ─────────────────────────────── 절마다 공부하기 ─────────────────────────────── */
type StudyMode = "view" | "blankVerse" | "blankAnno";

function ByVerseStudy({ exam }: { exam: Exam }) {
  const [verseNum, setVerseNum] = useState<number>(exam.verses[0]?.verse ?? 1);
  const [studyMode, setStudyMode] = useState<StudyMode>("view");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [annoInputs, setAnnoInputs] = useState<Record<number, string>>({});
  const [graded, setGraded] = useState<Record<string, boolean> | null>(null);
  const [annoGraded, setAnnoGraded] = useState<Record<number, boolean> | null>(null);

  const verse = exam.verses.find((v) => v.verse === verseNum);
  const marks = useMemo(() => {
    if (!verse) return [];
    return verse.segments.filter(
      (s): s is Extract<typeof s, { kind: "mark" }> => s.kind === "mark"
    );
  }, [verse]);
  // 채점 대상 주석: memorizeOnly 가 아닌 것 (설명/하위 내용이 있는 것)
  const gradableAnnos = useMemo(
    () => (verse?.annotations ?? []).filter((a) => !a.memorizeOnly),
    [verse]
  );

  function reset() {
    setInputs({});
    setAnnoInputs({});
    setGraded(null);
    setAnnoGraded(null);
  }
  function selectVerse(n: number) {
    setVerseNum(n);
    setStudyMode("view");
    reset();
  }
  function setMode(m: StudyMode) {
    setStudyMode(m);
    reset();
  }
  function gradeAll() {
    if (!verse) return;
    const missed: string[] = [];
    let total = 0;

    if (studyMode === "blankVerse") {
      const r: Record<string, boolean> = {};
      for (const m of marks) {
        const v = inputs[keyOf(verse.verse, m.num)] ?? "";
        r[keyOf(verse.verse, m.num)] = isCorrect(v, m.text);
        if (!r[keyOf(verse.verse, m.num)]) missed.push(m.text);
      }
      setGraded(r);
      total = marks.length;
    } else if (studyMode === "blankAnno") {
      const ar: Record<number, boolean> = {};
      for (const a of gradableAnnos) {
        const ans = buildExpectedAnswer(a);
        const userVal = annoInputs[a.num] ?? "";
        ar[a.num] = userVal.trim() ? strictMatch(userVal, ans) : false;
        if (!ar[a.num]) missed.push(`주석 ${circled(a.num)} ${a.phrase}`);
      }
      setAnnoGraded(ar);
      total = gradableAnnos.length;
    }

    try {
      if (total > 0) {
        addAttempt({
          chapter: chOf(exam, verse) ?? exam.chapter,
          verse: verse.verse,
          mode: "blank",
          correct: missed.length === 0,
          missedWords: missed,
          total,
        });
      }
    } catch {
      /* ignore */
    }
  }

  if (!verse) return null;

  const blankCorrect = graded ? Object.values(graded).filter(Boolean).length : 0;
  const annoCorrect = annoGraded ? Object.values(annoGraded).filter(Boolean).length : 0;
  const totalCorrect =
    studyMode === "blankVerse" ? blankCorrect : studyMode === "blankAnno" ? annoCorrect : 0;
  const totalQuestions =
    studyMode === "blankVerse"
      ? marks.length
      : studyMode === "blankAnno"
      ? gradableAnnos.length
      : 0;
  const showResult =
    (studyMode === "blankVerse" && graded) ||
    (studyMode === "blankAnno" && annoGraded);

  return (
    <div className="space-y-4">
      <VerseFilter
        verses={exam.verses.map((v) => v.verse)}
        selected={verseNum}
        onChange={(v) => v !== null && selectVerse(v)}
        allowAll={false}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "view" as const, label: "👁 보이기" },
              { id: "blankVerse" as const, label: "📝 구절 시험" },
              { id: "blankAnno" as const, label: "🧾 주석 시험" },
            ]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`text-xs rounded-full border px-3 py-1.5 transition ${
                studyMode === m.id
                  ? "bg-sky-700 border-sky-700 text-white"
                  : "bg-white border-slate-300 hover:bg-slate-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-600">
          계 {chOf(exam, verse)}:{verse.verse}
          {studyMode === "blankVerse" && (
            <>
              {" · 빈칸 "}
              <span className="font-semibold">{marks.length}</span>개
            </>
          )}
          {studyMode === "blankAnno" && (
            <>
              {" · 주석 "}
              <span className="font-semibold">{gradableAnnos.length}</span>개
            </>
          )}
          {showResult && totalQuestions > 0 && (
            <>
              {" · "}
              <span
                className={
                  totalCorrect === totalQuestions
                    ? "text-emerald-700"
                    : "text-sky-700"
                }
              >
                맞춤 {totalCorrect}/{totalQuestions}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <VerseHeader chapter={chOf(exam, verse)} verse={verse.verse} />
        {studyMode === "blankVerse" ? (
          /* 구절 시험: 본문 빈칸, 주석 숨김 */
          <p className="leading-loose text-[17px] text-slate-800">
            {verse.segments.map((s, i) => {
              if (s.kind === "text") return <span key={i}>{s.text}</span>;
              const k = keyOf(verse.verse, s.num);
              const val = inputs[k] ?? "";
              const result = graded?.[k];
              const width = Math.max(s.text.length, 4) + 2;
              return (
                <span key={i} className="whitespace-nowrap">
                  <span className="text-sky-700 font-semibold text-sm mr-0.5">
                    {circled(s.num)}
                  </span>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [k]: e.target.value }))
                    }
                    spellCheck={false}
                    autoComplete="off"
                    className={`inline-block align-baseline border-b-2 px-1 text-center outline-none bg-transparent transition ${
                      result === false
                        ? "border-red-500 text-red-700"
                        : result === true
                        ? "border-emerald-500 text-emerald-700"
                        : "border-sky-400 focus:border-sky-700"
                    }`}
                    style={{ width: `${width}ch` }}
                  />
                </span>
              );
            })}
          </p>
        ) : (
          /* 보기 모드 + 주석 시험: 본문은 형광펜으로 그대로 */
          <VerseHighlighted verse={verse} />
        )}

        {/* 구절 시험 채점 후 정답 표시 */}
        {studyMode === "blankVerse" && graded && (
          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
            <span className="text-xs font-semibold text-sky-700 mr-2">정답</span>
            {verse.segments
              .map((s) => (s.kind === "text" ? s.text : `[${circled(s.num)} ${s.text}]`))
              .join("")}
          </div>
        )}

        {/* 보기 모드: 주석 펼침 */}
        {studyMode === "view" && verse.annotations.length > 0 && (
          <ul className="mt-4 space-y-2">
            {verse.annotations.map((a) => (
              <AnnotationCard key={a.num} a={a} state="open" />
            ))}
          </ul>
        )}

        {/* 주석 시험: 입력 + 채점 결과 */}
        {studyMode === "blankAnno" && verse.annotations.length > 0 && (
          <ul className="mt-4 space-y-3">
            {verse.annotations.map((a) => {
              if (a.memorizeOnly) {
                return (
                  <li
                    key={a.num}
                    className="rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                  >
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sky-700 font-semibold">
                        {circled(a.num)}
                      </span>
                      <span className="font-medium">{a.phrase}</span>
                      <span className="ml-auto text-[10px] rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5">
                        성구 암기만
                      </span>
                    </div>
                  </li>
                );
              }
              const ok = annoGraded?.[a.num];
              const tint =
                ok === true
                  ? "border-emerald-300 bg-emerald-50/40"
                  : ok === false
                  ? "border-red-300 bg-red-50/40"
                  : "border-slate-200 bg-white";
              return (
                <li key={a.num} className={`rounded-lg border p-3 ${tint}`}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sky-700 font-semibold">
                      {circled(a.num)}
                    </span>
                    <span className="font-medium">{a.phrase}</span>
                    {a.term && (
                      <span className="text-sm text-slate-500">({a.term})</span>
                    )}
                    {ok === true && (
                      <span className="ml-auto text-[10px] rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5">
                        맞춤
                      </span>
                    )}
                    {ok === false && (
                      <span className="ml-auto text-[10px] rounded-full bg-red-100 text-red-800 border border-red-200 px-2 py-0.5">
                        오답
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={annoInputs[a.num] ?? ""}
                    onChange={(e) =>
                      setAnnoInputs((p) => ({ ...p, [a.num]: e.target.value }))
                    }
                    placeholder="이 어구의 의미·설명을 쓰세요…"
                    className={`mt-2 w-full rounded-lg border px-3 py-2 text-[15px] outline-none resize-y transition ${
                      ok === false
                        ? "border-red-400 focus:border-red-600"
                        : ok === true
                        ? "border-emerald-400 focus:border-emerald-600"
                        : "border-slate-300 focus:border-sky-600"
                    }`}
                  />
                  {/* 채점 후 정답 노출 */}
                  {annoGraded && (
                    <div className="mt-2 rounded-lg bg-white border border-slate-200 p-3 text-[14px] text-slate-700 space-y-1">
                      <div className="text-xs text-sky-700 font-semibold mb-1">정답</div>
                      {a.explanation && <p>: {a.explanation}</p>}
                      {a.subPoints && a.subPoints.length > 0 && (
                        <ul className="space-y-1">
                          {a.subPoints.map((p, i) => (
                            <li key={i} className="whitespace-pre-line">
                              <span className="text-sky-600 mr-1">-</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {studyMode !== "view" && (
        <>
          <div className="flex gap-2 justify-end">
            <button
              onClick={reset}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              초기화
            </button>
            <button
              onClick={gradeAll}
              className="rounded-lg bg-sky-700 text-white px-5 py-2 text-sm font-medium hover:bg-sky-800 shadow"
            >
              채점하기
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {studyMode === "blankVerse"
              ? "※ 정확 일치로 채점합니다."
              : "※ 키워드 일치(약 60%)로 채점합니다."}
          </p>
        </>
      )}

      {/* 절 이동 */}
      <div className="flex justify-between text-sm pt-2">
        {verseNum > exam.verses[0].verse ? (
          <button
            onClick={() => selectVerse(verseNum - 1)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            ← {verseNum - 1}절
          </button>
        ) : (
          <span />
        )}
        {verseNum < exam.verses[exam.verses.length - 1].verse ? (
          <button
            onClick={() => selectVerse(verseNum + 1)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            {verseNum + 1}절 →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── 보기 ─────────────────────────────── */
function FullView({ exam }: { exam: Exam }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
        <div className="text-xs text-sky-700 font-semibold">제목</div>
        <div className="mt-1 text-lg font-bold leading-snug">{exam.title}</div>
      </div>
      <ol className="space-y-5">
        {exam.verses.map((v) => (
          <li key={v.verse} className="rounded-2xl border border-slate-200 bg-white p-5">
            <VerseHeader chapter={chOf(exam, v)} verse={v.verse} />
            <VerseHighlighted verse={v} />
            {v.annotations.length > 0 && (
              <ul className="mt-4 space-y-2">
                {v.annotations.map((a) => (
                  <AnnotationCard key={a.num} a={a} state="open" />
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─────────────────────────────── 제목 시험 ─────────────────────────────── */
function TitleQuiz({ exam }: { exam: Exam }) {
  // 제목 문자열: "계 6장  배도한 선천 해·달·별에 대한 심판" → 정답은 뒷부분
  // 사용자가 적은 형식 그대로 정답으로 채택
  const fullTitle = exam.title;
  // "계 N장" 제외하고 뒷부분만 정답으로
  const m = fullTitle.match(/^계\s*\d+장\s+(.+)$/);
  const answer = (m?.[1] ?? fullTitle).trim();

  const [val, setVal] = useState("");
  const [result, setResult] = useState<null | boolean>(null);

  function check() {
    const ok = isCorrect(val, answer);
    setResult(ok);
  }
  function reset() {
    setVal("");
    setResult(null);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <div className="text-xs text-sky-700 font-semibold">계 {exam.chapter}장</div>
          <p className="mt-2 text-slate-700">
            이 장의 <span className="font-semibold">제목</span>을 정확히 쓰시오.
          </p>
        </div>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="제목을 입력하세요"
          spellCheck={false}
          className={`w-full rounded-lg border-2 px-4 py-3 text-lg outline-none transition ${
            result === true
              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
              : result === false
              ? "border-red-500 bg-red-50 text-red-800"
              : "border-slate-300 focus:border-sky-600"
          }`}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={reset}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            초기화
          </button>
          <button
            onClick={check}
            className="rounded-lg bg-sky-700 text-white px-5 py-2 text-sm font-medium hover:bg-sky-800"
          >
            채점하기
          </button>
        </div>

        {result === true && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
            ✅ 정답!
          </div>
        )}
        {result === false && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm space-y-1">
            <div className="text-red-800 font-semibold">❌ 오답</div>
            <div className="text-slate-700">
              정답: <span className="font-medium">{answer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── 빈칸 시험 ─────────────────────────────── */
function BlankQuiz({ exam }: { exam: Exam }) {
  const allMarks = useMemo(
    () =>
      exam.verses.flatMap((v) =>
        v.segments
          .filter((s): s is Extract<typeof s, { kind: "mark" }> => s.kind === "mark")
          .map((s) => ({ verse: v.verse, num: s.num, answer: s.text }))
      ),
    [exam]
  );

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, boolean> | null>(null);

  function gradeAll() {
    const r: Record<string, boolean> = {};
    for (const m of allMarks) {
      const v = inputs[keyOf(m.verse, m.num)] ?? "";
      r[keyOf(m.verse, m.num)] = isCorrect(v, m.answer);
    }
    setGraded(r);

    try {
      const byVerse = new Map<number, { total: number; missed: string[] }>();
      for (const m of allMarks) {
        const cur = byVerse.get(m.verse) ?? { total: 0, missed: [] as string[] };
        cur.total++;
        if (!r[keyOf(m.verse, m.num)]) cur.missed.push(m.answer);
        byVerse.set(m.verse, cur);
      }
      for (const [verseNum, entry] of byVerse) {
        if (entry.total === 0) continue;
        const verseObj = exam.verses.find((vv) => vv.verse === verseNum);
        addAttempt({
          chapter: verseObj ? chOf(exam, verseObj) : exam.chapter,
          verse: verseNum,
          mode: "blank",
          correct: entry.missed.length === 0,
          missedWords: entry.missed,
          total: entry.total,
          
        });
      }
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    setInputs({});
    setGraded(null);
  }

  const totalCorrect = graded ? Object.values(graded).filter(Boolean).length : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
        총 빈칸 <span className="font-semibold">{allMarks.length}</span>개
        {graded && (
          <>
            {" · "}
            <span
              className={
                totalCorrect === allMarks.length ? "text-emerald-700" : "text-sky-700"
              }
            >
              맞춤 {totalCorrect}/{allMarks.length}
            </span>
          </>
        )}
      </div>

      <ol className="space-y-5">
        {exam.verses.map((v) => (
          <li key={v.verse} className="rounded-2xl border border-slate-200 bg-white p-5">
            <VerseHeader chapter={chOf(exam, v)} verse={v.verse} />
            <p className="leading-loose text-[17px] text-slate-800">
              {v.segments.map((s, i) => {
                if (s.kind === "text") return <span key={i}>{s.text}</span>;
                const k = keyOf(v.verse, s.num);
                const val = inputs[k] ?? "";
                const result = graded?.[k];
                const width = Math.max(s.text.length, 4) + 2;
                return (
                  <span key={i} className="whitespace-nowrap">
                    <span className="text-sky-700 font-semibold text-sm mr-0.5">
                      {circled(s.num)}
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [k]: e.target.value }))
                      }
                      spellCheck={false}
                      autoComplete="off"
                      className={`inline-block align-baseline border-b-2 px-1 text-center outline-none bg-transparent transition ${
                        result === false
                          ? "border-red-500 text-red-700"
                          : result === true
                          ? "border-emerald-500 text-emerald-700"
                          : "border-sky-400 focus:border-sky-700"
                      }`}
                      style={{ width: `${width}ch` }}
                    />
                  </span>
                );
              })}
            </p>

            {graded && v.annotations.length > 0 && (
              <ul className="mt-4 space-y-2">
                {v.annotations.map((a) => {
                  const ok = graded[keyOf(v.verse, a.num)];
                  return <AnnotationCard key={a.num} a={a} state={ok ? "ok" : "wrong"} />;
                })}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <div className="sticky bottom-2 flex gap-2 justify-end">
        <button
          onClick={reset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          초기화
        </button>
        <button
          onClick={gradeAll}
          className="rounded-lg bg-sky-700 text-white px-5 py-2 text-sm font-medium hover:bg-sky-800 shadow"
        >
          채점하기
        </button>
      </div>

      {graded && totalCorrect === allMarks.length && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          ✅ 모두 정답! ({allMarks.length}/{allMarks.length})
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── 주석 시험 ─────────────────────────────── */
function AnnotationQuiz({ exam }: { exam: Exam }) {
  const items = useMemo(
    () =>
      exam.verses.flatMap((v) =>
        v.annotations.map((a) => ({ verse: v.verse, anno: a }))
      ),
    [exam]
  );
  const gradable = items.filter((it) => !it.anno.memorizeOnly);

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [marks, setMarks] = useState<Record<string, "ok" | "wrong" | null>>({});

  function k(verse: number, num: number) {
    return `${verse}-${num}`;
  }
  function reveal(key: string) {
    setRevealed((r) => ({ ...r, [key]: true }));
  }
  function mark(key: string, m: "ok" | "wrong") {
    setMarks((prev) => ({ ...prev, [key]: m }));
  }
  function revealAll() {
    const r: Record<string, boolean> = {};
    for (const it of items) r[k(it.verse, it.anno.num)] = true;
    setRevealed(r);
  }
  function autoGrade() {
    // 자동 채점: 사용자 답안 안에 정답의 핵심(공백·문장부호 제거 후 65% 이상) 포함되면 ok
    const m: Record<string, "ok" | "wrong" | null> = {};
    for (const it of items) {
      const key = k(it.verse, it.anno.num);
      if (it.anno.memorizeOnly) continue;
      const ans = buildExpectedAnswer(it.anno);
      const userVal = inputs[key] ?? "";
      if (!userVal.trim()) {
        m[key] = "wrong";
        continue;
      }
      m[key] = strictMatch(userVal, ans) ? "ok" : "wrong";
    }
    setMarks(m);
    // 모든 카드 정답도 펼침
    const r: Record<string, boolean> = {};
    for (const it of items) r[k(it.verse, it.anno.num)] = true;
    setRevealed(r);

    // 오답노트 기록
    try {
      const byVerse = new Map<number, { total: number; missed: string[] }>();
      for (const it of items) {
        if (it.anno.memorizeOnly) continue;
        const key = k(it.verse, it.anno.num);
        const cur = byVerse.get(it.verse) ?? { total: 0, missed: [] as string[] };
        cur.total++;
        if (m[key] !== "ok") cur.missed.push(`${circled(it.anno.num)} ${it.anno.phrase}`);
        byVerse.set(it.verse, cur);
      }
      for (const [verseNum, entry] of byVerse) {
        if (entry.total === 0) continue;
        const verseObj = exam.verses.find((vv) => vv.verse === verseNum);
        addAttempt({
          chapter: verseObj ? chOf(exam, verseObj) : exam.chapter,
          verse: verseNum,
          mode: "blank",
          correct: entry.missed.length === 0,
          missedWords: entry.missed,
          total: entry.total,
          
        });
      }
    } catch {
      /* ignore */
    }
  }
  function reset() {
    setInputs({});
    setRevealed({});
    setMarks({});
  }

  const okCount = Object.values(marks).filter((x) => x === "ok").length;
  const total = gradable.length;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          총 주석 <span className="font-semibold">{total}</span>개 (성구 암기만 제외)
          {Object.keys(marks).length > 0 && (
            <>
              {" · "}
              <span className={okCount === total ? "text-emerald-700" : "text-sky-700"}>
                맞춤 {okCount}/{total}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-1 text-xs">
          <button
            onClick={revealAll}
            className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
          >
            모두 정답 보기
          </button>
        </div>
      </div>

      <ol className="space-y-3">
        {items.map(({ verse, anno }) => {
          const key = k(verse, anno.num);
          const userVal = inputs[key] ?? "";
          const shown = !!revealed[key];
          const mk = marks[key] ?? null;
          const tint =
            mk === "ok"
              ? "border-emerald-300 bg-emerald-50/40"
              : mk === "wrong"
              ? "border-red-300 bg-red-50/40"
              : "border-slate-200 bg-white";

          return (
            <li key={key} className={`rounded-2xl border p-4 ${tint}`}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500">
                  계 {exam.chapter}:{verse}
                </span>
                <span className="text-sky-700 font-semibold">{circled(anno.num)}</span>
                <span className="font-medium">{anno.phrase}</span>
                {anno.term && (
                  <span className="text-sm text-slate-500">({anno.term})</span>
                )}
                {anno.memorizeOnly && (
                  <span className="ml-auto text-[10px] rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5">
                    성구 암기만
                  </span>
                )}
              </div>

              {anno.memorizeOnly ? (
                <p className="mt-2 ml-1 text-xs text-amber-700">
                  본문 그대로 외우면 됩니다. (별도 풀이 없음)
                </p>
              ) : (
                <>
                  <textarea
                    rows={2}
                    value={userVal}
                    onChange={(e) =>
                      setInputs((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder="이 어구의 의미를 떠올려서 쓰세요…"
                    className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-[15px] outline-none focus:border-sky-600 resize-y"
                  />
                  <div className="mt-2 flex gap-2 justify-end text-xs">
                    {!shown ? (
                      <button
                        onClick={() => reveal(key)}
                        className="rounded border border-sky-700 text-sky-700 bg-white px-3 py-1.5 hover:bg-sky-50"
                      >
                        정답 보기
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => mark(key, "wrong")}
                          className={`rounded border px-3 py-1.5 ${
                            mk === "wrong"
                              ? "border-red-500 bg-red-100 text-red-800"
                              : "border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          ✗ 틀림
                        </button>
                        <button
                          onClick={() => mark(key, "ok")}
                          className={`rounded border px-3 py-1.5 ${
                            mk === "ok"
                              ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                              : "border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          ✓ 맞음
                        </button>
                      </>
                    )}
                  </div>

                  {shown && (
                    <div className="mt-3 rounded-lg bg-white border border-slate-200 p-3 text-[15px] text-slate-700 space-y-1">
                      <div className="text-xs text-sky-700 font-semibold mb-1">정답</div>
                      {anno.explanation && <p>: {anno.explanation}</p>}
                      {anno.subPoints && anno.subPoints.length > 0 && (
                        <ul className="space-y-1">
                          {anno.subPoints.map((p, i) => (
                            <li key={i} className="whitespace-pre-line">
                              <span className="text-sky-600 mr-1">-</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
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
          onClick={autoGrade}
          className="rounded-lg bg-sky-700 text-white px-5 py-2 text-sm font-medium hover:bg-sky-800 shadow"
        >
          자동 채점
        </button>
      </div>
      <p className="text-xs text-slate-400">
        ※ 자동 채점은 키워드 일치 기반이라 완벽하지 않습니다. ‘정답 보기’ 후 직접 ✓/✗ 표시도 가능합니다.
      </p>
    </div>
  );
}

/* ─────────────────────────────── 전문 쓰기 시험 ─────────────────────────────── */
function FullTextQuiz({ exam }: { exam: Exam }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, boolean> | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  const keyOfVerse = (v: ExamVerse) => `${chOf(exam, v)}-${v.verse}`;

  function gradeAll() {
    const r: Record<string, boolean> = {};
    const missed: string[] = [];
    for (const v of exam.verses) {
      const k = keyOfVerse(v);
      const val = inputs[k] ?? "";
      const expected = verseFullText(v);
      const ok = strictMatch(val, expected);
      r[k] = ok;
      if (!ok) missed.push(`계 ${chOf(exam, v)}:${v.verse}`);
    }
    setGraded(r);

    try {
      for (const v of exam.verses) {
        addAttempt({
          chapter: chOf(exam, v),
          verse: v.verse,
          mode: "blank",
          correct: r[keyOfVerse(v)],
          missedWords: r[keyOfVerse(v)] ? [] : [verseFullText(v)],
          total: 1,
        });
      }
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setInputs({});
    setGraded(null);
    setShowAnswers({});
  }

  function toggleAnswer(k: string) {
    setShowAnswers((p) => ({ ...p, [k]: !p[k] }));
  }

  const correctCount = graded ? Object.values(graded).filter(Boolean).length : 0;
  const total = exam.verses.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
        총 {total}절 · 전문 쓰기
        {graded && (
          <>
            {" · "}
            <span
              className={
                correctCount === total ? "text-emerald-700" : "text-sky-700"
              }
            >
              맞춤 {correctCount}/{total}
            </span>
          </>
        )}
      </div>

      <ol className="space-y-4">
        {exam.verses.map((v) => {
          const k = keyOfVerse(v);
          const val = inputs[k] ?? "";
          const result = graded?.[k];
          const expected = verseFullText(v);
          const shown = showAnswers[k];
          return (
            <li
              key={k}
              className={`rounded-2xl border bg-white p-5 transition ${
                result === true
                  ? "border-emerald-300 bg-emerald-50/30"
                  : result === false
                  ? "border-red-300 bg-red-50/30"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <VerseHeader chapter={chOf(exam, v)} verse={v.verse} />
                {result !== undefined && (
                  <span
                    className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                      result
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {result ? "✓ 정답" : "✗ 오답"}
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={val}
                onChange={(e) =>
                  setInputs((p) => ({ ...p, [k]: e.target.value }))
                }
                placeholder={`${v.verse}절을 외운 그대로 입력하세요…`}
                spellCheck={false}
                className={`w-full rounded-lg border-2 px-3 py-2 text-[15px] leading-relaxed outline-none resize-y transition ${
                  result === false
                    ? "border-red-400 focus:border-red-600"
                    : result === true
                    ? "border-emerald-400 focus:border-emerald-600"
                    : "border-slate-300 focus:border-sky-600"
                }`}
              />
              {/* 채점 후 정답 토글 */}
              {graded && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleAnswer(k)}
                    className="text-xs text-sky-700 hover:underline"
                  >
                    {shown ? "정답 숨기기" : "정답 보기"}
                  </button>
                  {shown && (
                    <div className="mt-2 rounded-lg bg-white border border-slate-200 p-3 text-[14px] text-slate-700 leading-relaxed">
                      <span className="text-xs font-semibold text-sky-700 mr-2">정답</span>
                      {expected}
                    </div>
                  )}
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
          onClick={gradeAll}
          className="rounded-lg bg-sky-700 text-white px-5 py-2 text-sm font-medium hover:bg-sky-800 shadow"
        >
          채점하기
        </button>
      </div>
      <p className="text-xs text-slate-400">
        ※ 정확 일치로 채점합니다 (공백·줄바꿈만 무시).
      </p>
    </div>
  );
}

function buildExpectedAnswer(a: ExamAnnotation): string {
  return [a.explanation ?? "", ...(a.subPoints ?? [])].join(" ");
}

// 정확 일치 (공백 + 줄머리 불릿(- • · :) 만 무시)
// — 사용자 답안이 정답과 글자 그대로 같아야 OK.
// — 화면의 "- ", ": " 같은 시각적 불릿은 데이터에 없는 형식 문자라 무시.
function strictMatch(user: string, expected: string): boolean {
  const norm = (s: string) =>
    s
      // 각 줄 시작의 불릿/콜론
      .replace(/(^|\n)[ \t]*[-•*·:][ \t]*/g, "$1")
      // 가운데 공백으로 둘러싸인 불릿
      .replace(/\s+[-•*·]\s+/g, " ")
      // 모든 공백 제거
      .replace(/\s+/g, "");
  const u = norm(user);
  const e = norm(expected);
  return u.length > 0 && u === e;
}

/* ─────────────────────────────── 공용 ─────────────────────────────── */
function VerseHeader({ chapter, verse }: { chapter: number; verse: number }) {
  return (
    <div className="text-xs text-sky-700 font-semibold mb-2">
      계 {chapter}:{verse}
    </div>
  );
}
function VerseHighlighted({ verse }: { verse: ExamVerse }) {
  return (
    <p className="leading-loose text-[17px] text-slate-800">
      {verse.segments.map((s, i) => {
        if (s.kind === "text") return <span key={i}>{s.text}</span>;
        return (
          <span
            key={i}
            className="bg-yellow-100 border-b-2 border-yellow-400 px-0.5 rounded-sm"
          >
            <span className="text-sky-700 font-semibold text-sm mr-0.5 align-baseline">
              {circled(s.num)}
            </span>
            {s.text}
          </span>
        );
      })}
    </p>
  );
}
function AnnotationCard({
  a,
  state,
}: {
  a: ExamAnnotation;
  state: "open" | "ok" | "wrong";
}) {
  const tint =
    state === "ok"
      ? "border-emerald-200 bg-emerald-50/40"
      : state === "wrong"
      ? "border-red-200 bg-red-50/40"
      : "border-slate-200 bg-white";

  return (
    <li className={`rounded-lg border p-3 ${tint}`}>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-sky-700 font-semibold">{circled(a.num)}</span>
        <span className="font-medium">{a.phrase}</span>
        {a.term && <span className="text-sm text-slate-500">({a.term})</span>}
        {state === "ok" && (
          <span className="ml-auto text-[10px] rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5">
            맞춤
          </span>
        )}
        {state === "wrong" && (
          <span className="ml-auto text-[10px] rounded-full bg-red-100 text-red-800 border border-red-200 px-2 py-0.5">
            오답
          </span>
        )}
        {a.memorizeOnly && (
          <span className="ml-auto text-[10px] rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5">
            성구 암기만
          </span>
        )}
      </div>
      {!a.memorizeOnly && (
        <div className="mt-2 ml-6 text-[15px] text-slate-700 space-y-1">
          {a.explanation && <p>: {a.explanation}</p>}
          {a.subPoints && a.subPoints.length > 0 && (
            <ul className="space-y-1">
              {a.subPoints.map((p, i) => (
                <li key={i} className="whitespace-pre-line">
                  <span className="text-sky-600 mr-1">-</span>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function VerseFilter({
  verses,
  selected,
  onChange,
  allowAll = true,
}: {
  verses: number[];
  selected: number | null;
  onChange: (v: number | null) => void;
  allowAll?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
      <div className="text-xs text-slate-500">절 선택</div>
      <div className="flex flex-wrap gap-1">
        {allowAll && (
          <button
            onClick={() => onChange(null)}
            className={`text-xs rounded-full border px-3 py-1.5 transition ${
              selected === null
                ? "bg-sky-700 border-sky-700 text-white"
                : "bg-white border-slate-300 hover:bg-slate-50"
            }`}
          >
            전체
          </button>
        )}
        {verses.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`text-xs rounded-full border px-3 py-1.5 transition tabular-nums ${
              selected === v
                ? "bg-sky-700 border-sky-700 text-white"
                : "bg-white border-slate-300 hover:bg-slate-50"
            }`}
          >
            {v}절
          </button>
        ))}
      </div>
    </div>
  );
}
