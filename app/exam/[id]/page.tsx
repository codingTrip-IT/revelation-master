import { notFound } from "next/navigation";
import Link from "next/link";
import { EXAMS, getExam } from "@/data/exams";
import ExamView from "@/components/exam/ExamView";

export function generateStaticParams() {
  return EXAMS.map((e) => ({ id: e.id }));
}

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">시험</div>
          <h1 className="text-2xl font-bold mt-1 leading-snug">계 {exam.chapter}장</h1>
        </div>
        <Link href="/exam" className="text-sm text-sky-700 hover:underline shrink-0">
          ← 목록
        </Link>
      </div>
      <ExamView exam={exam} />
    </div>
  );
}
