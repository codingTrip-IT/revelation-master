"use client";

import { useEffect, useState } from "react";

// 빌드 시 주입된 PIN. 없으면 잠금 비활성.
const PIN = process.env.NEXT_PUBLIC_APP_PIN;
const STORAGE_KEY = "rm_unlocked_at";
// 한 번 풀면 30일 유지
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export default function PinGate({ children }: { children: React.ReactNode }) {
  // null = 첫 렌더(판단 중), true/false = 결정됨
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!PIN) {
      setUnlocked(true);
      return;
    }
    try {
      const ts = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (ts && Date.now() - ts < TTL_MS) {
        setUnlocked(true);
      } else {
        setUnlocked(false);
      }
    } catch {
      setUnlocked(false);
    }
  }, []);

  function submit() {
    if (input === PIN) {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput("");
    }
  }

  // 첫 렌더 (SSR or pre-mount) — 빈 화면
  if (unlocked === null) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-300 text-sm">
        …
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  // 잠금 화면
  return (
    <div className="min-h-screen grid place-items-center bg-sky-50 p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 w-full max-w-sm space-y-5 shadow-sm">
        <div className="text-center space-y-1">
          <div className="text-3xl">📖🔒</div>
          <h1 className="text-xl font-bold">계시록 마스터</h1>
          <p className="text-sm text-slate-500">PIN 4자리를 입력하세요</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && input.length === 4 && submit()}
          className={`w-full text-center text-3xl tracking-[0.6em] py-4 rounded-xl border-2 outline-none bg-slate-50 ${
            error
              ? "border-red-500 bg-red-50"
              : "border-slate-300 focus:border-sky-600 focus:bg-white"
          }`}
        />
        {error && (
          <p className="text-sm text-red-600 text-center">PIN이 일치하지 않습니다</p>
        )}
        <button
          onClick={submit}
          disabled={input.length !== 4}
          className="w-full rounded-xl bg-sky-700 text-white py-3 font-medium disabled:opacity-40 hover:bg-sky-800"
        >
          잠금 해제
        </button>
        <p className="text-[11px] text-slate-400 text-center">
          한 번 풀면 이 기기에서 30일 유지됩니다.
        </p>
      </div>
    </div>
  );
}

// 헤더에서 잠그기 버튼용
export function lockNow() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.location.reload();
}
