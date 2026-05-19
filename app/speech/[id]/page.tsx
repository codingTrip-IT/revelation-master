import { notFound } from "next/navigation";
import Link from "next/link";
import { SPEECH_SECTIONS, getSpeechSection } from "@/data/speech";
import SpeechView from "@/components/speech/SpeechView";

export function generateStaticParams() {
  return SPEECH_SECTIONS.map((s) => ({ id: s.id }));
}

export default async function SpeechSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = getSpeechSection(id);
  if (!section) return notFound();

  const idx = SPEECH_SECTIONS.findIndex((s) => s.id === id);
  const prev = idx > 0 ? SPEECH_SECTIONS[idx - 1] : null;
  const next = idx < SPEECH_SECTIONS.length - 1 ? SPEECH_SECTIONS[idx + 1] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">
            스피치 · {section.group}
            {section.range ? ` · ${section.range}` : ""}
          </div>
          <h1 className="text-2xl font-bold mt-1">{section.title}</h1>
        </div>
        <Link href="/speech" className="text-sm text-sky-700 hover:underline shrink-0">
          ← 목록
        </Link>
      </div>

      <SpeechView section={section} />

      <div className="flex justify-between text-sm pt-2">
        {prev ? (
          <Link
            href={`/speech/${prev.id}`}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/speech/${next.id}`}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
