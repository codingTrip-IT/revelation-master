"use client";

import { useEffect, useState } from "react";
import {
  addSilsangNote,
  deleteSilsangNote,
  listSilsangNotes,
  type SilsangNote,
} from "@/lib/storage";
import type { SilsangEntry } from "@/data/silsang";

export default function SilsangBoard({ presets }: { presets: SilsangEntry[] }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<SilsangNote[]>([]);
  const [draft, setDraft] = useState({ parable: "", silsang: "", verseRef: "" });

  async function load() {
    try {
      const list = await listSilsangNotes();
      setNotes(list);
    } catch {
      /* offline */
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function addNote() {
    if (!draft.parable.trim() || !draft.silsang.trim()) return;
    await addSilsangNote({
      parable: draft.parable.trim(),
      silsang: draft.silsang.trim(),
      verseRef: draft.verseRef.trim() || undefined,
    });
    setDraft({ parable: "", silsang: "", verseRef: "" });
    load();
  }

  async function removeNote(id?: number) {
    if (!id) return;
    await deleteSilsangNote(id);
    load();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">프리셋 ({presets.length})</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {presets.map((s, i) => (
            <li
              key={i}
              onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
              className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-sky-400 transition select-none"
            >
              <div className="text-xs text-slate-500">
                {s.verseRefs?.join(", ") || ""}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-semibold">{s.parable}</span>
                <span className="text-sky-700">→</span>
                <span className={flipped[i] ? "text-slate-800" : "text-slate-300"}>
                  {flipped[i] ? s.silsang : "?? ?? ??"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">내 실상 노트</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="grid sm:grid-cols-[1fr_1fr_8rem_5rem] gap-2">
            <input
              placeholder="비유"
              value={draft.parable}
              onChange={(e) => setDraft({ ...draft, parable: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="실상"
              value={draft.silsang}
              onChange={(e) => setDraft({ ...draft, silsang: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="참조 (예: 계1:20)"
              value={draft.verseRef}
              onChange={(e) => setDraft({ ...draft, verseRef: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={addNote}
              className="rounded bg-sky-700 text-white text-sm px-3 py-2 hover:bg-sky-800"
            >
              추가
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">아직 저장된 노트가 없습니다.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 mt-4">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-slate-200 bg-white p-3 flex items-start justify-between gap-2"
              >
                <div className="text-sm">
                  <div className="text-xs text-slate-500">{n.verseRef}</div>
                  <div>
                    <span className="font-semibold">{n.parable}</span>
                    <span className="text-sky-700 mx-1">→</span>
                    <span>{n.silsang}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeNote(n.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
