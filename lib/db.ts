// Dexie 기반 로컬 저장소 (IndexedDB)
// 브라우저에만 존재. 서버 렌더에서 불러도 안전하도록 lazy import.

import Dexie, { Table } from "dexie";

export type Attempt = {
  id?: number;
  chapter: number;
  verse: number;
  mode: "blank" | "first" | "order";
  correct: boolean;
  missedWords: string[]; // 틀린 단어들
  total: number; // 빈칸 총 개수
  createdAt: number;
};

export type SilsangNote = {
  id?: number;
  // parable + (선택)verseRef 로 고유성 관리
  parable: string;
  silsang: string;
  verseRef?: string;
  note?: string;
  updatedAt: number;
};

export type ChapterProgress = {
  chapter: number; // 1~22 (1장은 1로 통합)
  titleLearned: boolean;
  summaryLearned: boolean;
  pictureLearned: boolean;
  memorizedVerses: number[]; // 외운 절들
  updatedAt: number;
};

export type VerseImage = {
  id?: number;
  chapter: number;
  verse: number; // 0 = 장 전체용
  url: string;
  prompt: string;
  style?: string;
  seed?: number;
  createdAt: number;
};

class RevDB extends Dexie {
  attempts!: Table<Attempt, number>;
  silsangNotes!: Table<SilsangNote, number>;
  chapterProgress!: Table<ChapterProgress, number>;
  verseImages!: Table<VerseImage, number>;

  constructor() {
    super("revelation-master");
    this.version(1).stores({
      attempts: "++id, chapter, verse, correct, createdAt",
      silsangNotes: "++id, parable, verseRef, updatedAt",
      chapterProgress: "chapter, updatedAt",
    });
    this.version(2).stores({
      attempts: "++id, chapter, verse, correct, createdAt",
      silsangNotes: "++id, parable, verseRef, updatedAt",
      chapterProgress: "chapter, updatedAt",
      verseImages: "++id, [chapter+verse], chapter, createdAt",
    });
  }
}

let _db: RevDB | null = null;
export function db(): RevDB {
  if (typeof window === "undefined") {
    throw new Error("db() must be called in the browser");
  }
  if (!_db) _db = new RevDB();
  return _db;
}
