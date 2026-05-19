"use client";

import { useEffect, useState } from "react";
import { storageBackend } from "@/lib/storage";
import { getDeviceId, getUserCode, setUserCode } from "@/lib/supabase";

export default function SettingsView() {
  const [backend, setBackend] = useState<"supabase" | "indexeddb">("indexeddb");
  const [deviceId, setDeviceId] = useState("");
  const [code, setCodeState] = useState("");
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    setBackend(storageBackend());
    setDeviceId(getDeviceId());
    setCodeState(getUserCode() ?? "");
  }, []);

  function save() {
    const trimmed = code.trim();
    setUserCode(trimmed || null);
    setDeviceId(getDeviceId());
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 2000);
  }

  function clear() {
    setUserCode(null);
    setCodeState("");
    setDeviceId(getDeviceId());
  }

  return (
    <div className="space-y-5">
      {/* 백엔드 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
        <h2 className="font-semibold">현재 저장소</h2>
        {backend === "supabase" ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
            <div className="font-semibold text-emerald-800 mb-1">
              ☁️ Supabase (클라우드 동기화)
            </div>
            <p className="text-emerald-700">
              데이터가 클라우드에 영구 저장됩니다. 다른 기기에서도 같은 사용자 코드를
              입력하면 동일한 데이터를 보게 됩니다.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
            <div className="font-semibold text-amber-800 mb-1">
              💾 브라우저 로컬 (IndexedDB)
            </div>
            <p className="text-amber-700">
              데이터가 이 브라우저에만 저장됩니다. 다른 기기에서는 보이지 않습니다.
              Supabase 연결 방법은 <code>README.md</code>를 참고하세요.
            </p>
          </div>
        )}
      </section>

      {/* 사용자 코드 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">사용자 코드 (선택)</h2>
        <p className="text-sm text-slate-600">
          여러 기기(PC/폰)에서 같은 데이터를 보고 싶으면 같은 코드를 입력하세요.
          비워두면 이 기기 고유 ID로만 동작합니다.
        </p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCodeState(e.target.value)}
            placeholder="예: ckh1996 (영문 + 숫자, 본인만 알 수 있는 값)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={save}
            className="rounded-lg bg-sky-700 text-white px-4 py-2 text-sm hover:bg-sky-800"
          >
            저장
          </button>
          {code && (
            <button
              onClick={clear}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              초기화
            </button>
          )}
        </div>
        {savedHint && (
          <p className="text-xs text-emerald-700">✓ 저장됨. 페이지를 새로고침하세요.</p>
        )}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          현재 데이터 ID:{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded">{deviceId}</code>
        </div>
        <p className="text-xs text-amber-700">
          ⚠️ 보안: 이 코드를 아는 사람은 누구나 같은 데이터를 볼 수 있습니다.
          남에게 알려주지 마세요.
        </p>
      </section>
    </div>
  );
}
