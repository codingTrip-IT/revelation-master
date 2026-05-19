"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  clearAttempts,
  listAttempts,
  storageBackend,
  type Attempt,
} from "@/lib/storage";

export default function NotesView() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // Supabase 에 있는 전체 기록을 가져옴
      const a = await listAttempts(5000);
      setAttempts(a);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const wrongAttempts = attempts.filter((a) => !a.correct);

  // 단어 빈도 집계
  const wordFreq = new Map<string, number>();
  for (const a of wrongAttempts) for (const w of a.missedWords) {
    wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  }
  const topWords = [...wordFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);

  // 절 빈도 집계
  const verseFreq = new Map<string, { ch: number; v: number; count: number }>();
  for (const a of wrongAttempts) {
    const key = `${a.chapter}:${a.verse}`;
    const prev = verseFreq.get(key);
    if (prev) prev.count++;
    else verseFreq.set(key, { ch: a.chapter, v: a.verse, count: 1 });
  }
  const topVerses = [...verseFreq.values()].sort((a, b) => b.count - a.count).slice(0, 20);

  // 날짜별 그룹화
  const byDate = useMemo(() => groupByDate(attempts), [attempts]);

  const totalAttempts = attempts.length;
  const correctCount = attempts.filter((a) => a.correct).length;
  const accuracy = totalAttempts ? Math.round((correctCount / totalAttempts) * 100) : 0;

  async function clearAll() {
    if (!confirm("모든 기록을 삭제할까요?")) return;
    await clearAttempts();
    load();
  }

  async function exportJson() {
    const data = await listAttempts(10000);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revelation-attempts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const backend = storageBackend();

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg border px-3 py-2 text-xs flex items-center justify-between ${
          backend === "supabase"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        <span>
          저장소:{" "}
          <span className="font-semibold">
            {backend === "supabase"
              ? "☁️ Supabase (클라우드 동기화)"
              : "💾 브라우저 로컬 (IndexedDB)"}
          </span>
        </span>
        <button
          onClick={load}
          className="rounded border border-slate-300 bg-white text-slate-700 px-2 py-0.5 hover:bg-slate-50"
        >
          🔄 새로고침
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="총 시도" value={totalAttempts} />
        <Stat label="정답률" value={`${accuracy}%`} />
        <Stat label="틀린 절" value={topVerses.length} />
      </div>

      {/* 날짜별 기록 */}
      <section>
        <h2 className="font-semibold mb-2">날짜별 기록</h2>
        {loading ? (
          <p className="text-sm text-slate-500">불러오는 중…</p>
        ) : byDate.length === 0 ? (
          <p className="text-sm text-slate-500">아직 기록 없음.</p>
        ) : (
          <ul className="space-y-3">
            {byDate.map((day) => {
              const dayCorrect = day.attempts.filter((a) => a.correct).length;
              const dayAcc = Math.round(
                (dayCorrect / day.attempts.length) * 100
              );
              return (
                <li
                  key={day.date}
                  className="rounded-xl border border-slate-200 bg-white"
                >
                  <details open={day.isToday}>
                    <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{day.label}</span>
                        <span className="text-xs text-slate-500">
                          {day.dateLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>
                          시도 <span className="font-semibold">{day.attempts.length}</span>
                        </span>
                        <span
                          className={
                            dayAcc === 100
                              ? "text-emerald-700 font-semibold"
                              : "text-sky-700"
                          }
                        >
                          {dayAcc}%
                        </span>
                      </div>
                    </summary>
                    <ul className="border-t border-slate-100 divide-y divide-slate-100">
                      {day.attempts.map((a) => (
                        <li
                          key={a.id ?? `${a.chapter}-${a.verse}-${a.createdAt}`}
                          className={`px-4 py-2.5 text-sm flex flex-wrap items-center gap-2 ${
                            a.correct ? "" : "bg-red-50/40"
                          }`}
                        >
                          <span className="text-xs text-slate-500 tabular-nums">
                            {timeOf(a.createdAt)}
                          </span>
                          <span className="font-medium tabular-nums">
                            계 {a.chapter}:{a.verse}
                          </span>
                          <span
                            className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                              a.correct
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {a.correct
                              ? `✓ ${a.total}/${a.total}`
                              : `✗ ${a.total - a.missedWords.length}/${a.total}`}
                          </span>
                          {!a.correct && a.missedWords.length > 0 && (
                            <span className="text-xs text-red-700 break-all">
                              틀림:{" "}
                              {a.missedWords.slice(0, 3).join(", ")}
                              {a.missedWords.length > 3
                                ? ` 외 ${a.missedWords.length - 3}개`
                                : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">자주 틀린 단어 Top 30</h2>
        {topWords.length === 0 ? (
          <p className="text-sm text-slate-500">아직 기록 없음.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topWords.map(([w, c]) => (
              <span
                key={w}
                className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-sm text-red-800"
              >
                {w} <span className="text-red-500 font-semibold">×{c}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">자주 틀린 절 Top 20</h2>
        {topVerses.length === 0 ? (
          <p className="text-sm text-slate-500">아직 기록 없음.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {topVerses.map((v) => (
              <li
                key={`${v.ch}-${v.v}`}
                className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between"
              >
                <span className="text-sm">
                  계 {v.ch}:{v.v}{" "}
                  <span className="text-red-600 font-semibold">×{v.count}</span>
                </span>
                <Link
                  href={`/quiz`}
                  className="text-xs rounded bg-sky-700 text-white px-2 py-1 hover:bg-sky-800"
                >
                  재도전
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <button
          onClick={exportJson}
          className="text-sm rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
        >
          JSON 내보내기
        </button>
        <button
          onClick={clearAll}
          className="text-sm rounded border border-red-300 text-red-700 px-3 py-1.5 hover:bg-red-50"
        >
          기록 전체 삭제
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function timeOf(ms: number): string {
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

type DayGroup = {
  date: string; // YYYY-MM-DD
  label: string; // 오늘 / 어제 / N일 전 / 요일
  dateLabel: string; // 2026-05-15 (수)
  isToday: boolean;
  attempts: Attempt[];
};

function groupByDate(attempts: Attempt[]): DayGroup[] {
  const map = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const key = ymd(a.createdAt);
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }

  const now = new Date();
  const todayKey = ymd(now.getTime());
  const yesterdayKey = ymd(now.getTime() - 86400000);

  const result: DayGroup[] = [];
  for (const [date, list] of map) {
    list.sort((a, b) => b.createdAt - a.createdAt);
    const d = parseYmd(date);
    const daysAgo = Math.floor(
      (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) /
        86400000
    );

    let label: string;
    if (date === todayKey) label = "오늘";
    else if (date === yesterdayKey) label = "어제";
    else if (daysAgo > 0 && daysAgo < 7) label = `${daysAgo}일 전`;
    else label = WEEKDAYS[d.getDay()] + "요일";

    result.push({
      date,
      label,
      dateLabel: `${date} (${WEEKDAYS[d.getDay()]})`,
      isToday: date === todayKey,
      attempts: list,
    });
  }
  result.sort((a, b) => (a.date < b.date ? 1 : -1));
  return result;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function ymd(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
