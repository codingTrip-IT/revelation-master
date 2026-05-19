"use client";

import { useEffect, useState } from "react";
import type { Verse } from "@/data/revelation";
import {
  STYLE_PRESETS,
  type Style,
  buildPrompt,
  imageUrl,
  newSeed,
} from "@/lib/imagegen";
import {
  addVerseImage,
  deleteVerseImage,
  listVerseImages,
  type VerseImage,
} from "@/lib/storage";

export default function PictureGenerator({
  chapter,
  verses,
}: {
  chapter: number;
  verses: Verse[];
}) {
  const [verseNum, setVerseNum] = useState<number>(verses[0]?.verse ?? 1);
  const [style, setStyle] = useState<Style>("oil");
  const [addon, setAddon] = useState("");
  const [seed, setSeed] = useState<number>(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<VerseImage[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const verse = verses.find((v) => v.verse === verseNum);

  async function loadSaved() {
    try {
      const list = await listVerseImages(chapter);
      setSaved(list);
    } catch {
      /* SSR */
    }
  }
  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  function generate() {
    if (!verse) return;
    const prompt = buildPrompt({
      chapter,
      verse: verse.verse,
      verseText: verse.text,
      style,
      addon: addon.trim() || undefined,
    });
    const s = newSeed();
    setSeed(s);
    setLoading(true);
    setCurrentUrl(imageUrl(prompt, s));
  }

  function regenerate() {
    if (!verse) return;
    const prompt = buildPrompt({
      chapter,
      verse: verse.verse,
      verseText: verse.text,
      style,
      addon: addon.trim() || undefined,
    });
    const s = newSeed();
    setSeed(s);
    setLoading(true);
    setCurrentUrl(imageUrl(prompt, s));
  }

  async function saveCurrent() {
    if (!verse || !currentUrl) return;
    const prompt = buildPrompt({
      chapter,
      verse: verse.verse,
      verseText: verse.text,
      style,
      addon: addon.trim() || undefined,
    });
    await addVerseImage({
      chapter,
      verse: verse.verse,
      url: currentUrl,
      prompt,
      style,
      seed,
    });
    loadSaved();
  }

  async function deleteImage(id?: number) {
    if (!id) return;
    if (!confirm("이 이미지를 삭제할까요?")) return;
    await deleteVerseImage(id);
    loadSaved();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        절을 선택하고 스타일을 고른 뒤 “이미지 생성”을 누르면 그 자리에서 만들어집니다.
        마음에 들면 💾 저장하세요. (무료 · 비용 0원)
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="grid sm:grid-cols-[8rem_1fr] gap-3 items-start">
          <label className="text-sm font-medium pt-2">절</label>
          <select
            value={verseNum}
            onChange={(e) => setVerseNum(parseInt(e.target.value, 10))}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {verses.map((v) => (
              <option key={v.verse} value={v.verse}>
                계 {chapter}:{v.verse} — {v.text.slice(0, 40)}
                {v.text.length > 40 ? "…" : ""}
              </option>
            ))}
          </select>
        </div>

        {verse && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm leading-relaxed">
            <span className="text-xs text-sky-700 font-semibold mr-2">
              계 {chapter}:{verse.verse}
            </span>
            {verse.text}
          </div>
        )}

        <div>
          <div className="text-sm font-medium mb-2">스타일</div>
          <div className="flex flex-wrap gap-1">
            {STYLE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setStyle(p.id)}
                className={`text-xs rounded-full border px-3 py-1.5 transition ${
                  style === p.id
                    ? "bg-sky-700 border-sky-700 text-white"
                    : "bg-white border-slate-300 hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            추가 지시 <span className="text-slate-400 text-xs">(선택)</span>
          </label>
          <input
            value={addon}
            onChange={(e) => setAddon(e.target.value)}
            placeholder="예: 야경, 어둡고 장엄한 분위기, 황금빛 광채 …"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {currentUrl && (
            <>
              <button
                onClick={regenerate}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                🔄 다시 생성
              </button>
              <button
                onClick={saveCurrent}
                className="rounded-lg border border-sky-700 text-sky-700 bg-white px-3 py-2 text-sm hover:bg-sky-50"
              >
                💾 저장
              </button>
            </>
          )}
          <button
            onClick={generate}
            className="rounded-lg bg-sky-700 text-white px-4 py-2 text-sm font-medium hover:bg-sky-800"
          >
            🎨 이미지 생성
          </button>
        </div>
      </div>

      {/* 미리보기 */}
      {currentUrl && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="relative w-full bg-slate-50" style={{ aspectRatio: "16/9" }}>
            {loading && (
              <div className="absolute inset-0 grid place-items-center text-sm text-slate-500 z-10 bg-slate-50/80">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-sky-200 border-t-sky-700 rounded-full mx-auto mb-2" />
                  이미지 생성 중… (보통 10~30초)
                </div>
              </div>
            )}
            {/* next/image 가 외부 URL 제한 있으니 일반 img 사용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt={`계 ${chapter}:${verseNum}`}
              className="w-full h-full object-cover cursor-zoom-in"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              onClick={() => setLightbox(currentUrl)}
            />
          </div>
        </div>
      )}

      {/* 저장된 갤러리 */}
      {saved.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">
            저장된 이미지 ({saved.length})
          </h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {saved.map((img) => (
              <li
                key={img.id}
                className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`계 ${img.chapter}:${img.verse}`}
                  className="w-full aspect-video object-cover cursor-zoom-in"
                  onClick={() => setLightbox(img.url)}
                  loading="lazy"
                />
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5">
                  계 {img.chapter}:{img.verse}
                </div>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-slate-400">
        * 이미지 생성 by Pollinations.ai (오픈, 무료). 생성된 이미지의 사용 권리는 직접 확인하세요.
      </p>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/90 z-50 grid place-items-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
