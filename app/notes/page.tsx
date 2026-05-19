import NotesView from "@/components/notes/NotesView";

export default function NotesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">오답노트</h1>
        <p className="text-slate-600 text-sm mt-1">
          틀린 단어와 절을 모아서 빈도순으로 보여줍니다. 다시 도전 버튼으로 바로 재시도.
        </p>
      </div>
      <NotesView />
    </div>
  );
}
