import Link from "next/link";
import { notFound } from "next/navigation";
import { CHAPTERS } from "@/data/chapters";
import { getChapter, ALL_CHAPTERS } from "@/data/revelation";
import { PRESET_SILSANG } from "@/data/silsang";
import StudyTabs from "@/components/study/StudyTabs";

export function generateStaticParams() {
  return ALL_CHAPTERS.map((ch) => ({ chapter: String(ch) }));
}

export default async function StudyChapter({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const ch = parseInt(chapter, 10);
  if (!ch || ch < 1 || ch > 22) return notFound();

  const titleEntries = CHAPTERS.filter((c) => c.chapter === ch);
  const verses = getChapter(ch);
  const relatedSilsang = PRESET_SILSANG.filter((s) =>
    s.verseRefs?.some((r) => r.startsWith(`계${ch}:`) || r.startsWith(`계${ch}장`))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">계시록 {ch}장</div>
          <h1 className="text-2xl font-bold mt-1">
            {titleEntries.map((t) => t.title).join(" / ")}
          </h1>
          {titleEntries.some((t) => t.range) && (
            <div className="mt-1 text-sm text-slate-500">
              {titleEntries.map((t) => t.range).filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        <div className="flex gap-1 text-sm">
          {ch > 1 && (
            <Link href={`/study/${ch - 1}`} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">
              ← {ch - 1}장
            </Link>
          )}
          {ch < 22 && (
            <Link href={`/study/${ch + 1}`} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">
              {ch + 1}장 →
            </Link>
          )}
        </div>
      </div>

      <StudyTabs
        chapter={ch}
        titleEntries={titleEntries}
        verses={verses}
        relatedSilsang={relatedSilsang}
      />

      <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 text-sm flex flex-wrap items-center justify-between gap-2">
        <span>준비됐다면 빈칸 암기로 넘어가세요.</span>
        <Link
          href={`/quiz`}
          className="rounded bg-sky-700 text-white px-3 py-1.5 hover:bg-sky-800"
        >
          빈칸 문제 풀러가기 →
        </Link>
      </div>
    </div>
  );
}
