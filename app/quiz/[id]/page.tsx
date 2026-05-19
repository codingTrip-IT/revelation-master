import { notFound } from "next/navigation";
import { QUIZZES, getQuiz } from "@/data/quizzes";
import QuizRunner from "@/components/quiz/QuizRunner";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ id: q.id }));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = getQuiz(id);
  if (!quiz) return notFound();
  return <QuizRunner quiz={quiz} />;
}
