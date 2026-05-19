// 통합 저장소 API.
// - NEXT_PUBLIC_SUPABASE_URL/KEY 가 설정되면 Supabase
// - 없으면 IndexedDB (기존 Dexie) 로 fallback
//
// 컴포넌트는 이 파일의 함수만 사용 — 백엔드 교체에도 코드 변경 없음.

import { supabase, supabaseConfigured, getDeviceId } from "./supabase";
import { db, type Attempt, type SilsangNote, type VerseImage } from "./db";

export type { Attempt, SilsangNote, VerseImage };

// 새 레코드용 타입 (id, createdAt 등 자동 생성 필드 제외)
export type NewAttempt = Omit<Attempt, "id" | "createdAt"> & { createdAt?: number };
export type NewSilsangNote = Omit<SilsangNote, "id" | "updatedAt"> & {
  updatedAt?: number;
};
export type NewVerseImage = Omit<VerseImage, "id" | "createdAt"> & {
  createdAt?: number;
};

const useCloud = () => supabaseConfigured();

/* ────────────── attempts (오답노트) ────────────── */

export async function addAttempt(a: NewAttempt): Promise<void> {
  const createdAt = a.createdAt ?? Date.now();
  if (useCloud()) {
    const sb = supabase()!;
    await sb.from("attempts").insert({
      device_id: getDeviceId(),
      chapter: a.chapter,
      verse: a.verse,
      mode: a.mode,
      correct: a.correct,
      missed_words: a.missedWords,
      total: a.total,
      created_at: new Date(createdAt).toISOString(),
    });
    return;
  }
  await db().attempts.add({ ...a, createdAt });
}

export async function listAttempts(limit = 500): Promise<Attempt[]> {
  if (useCloud()) {
    const sb = supabase()!;
    const { data } = await sb
      .from("attempts")
      .select("*")
      .eq("device_id", getDeviceId())
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as number,
      chapter: r.chapter as number,
      verse: r.verse as number,
      mode: r.mode as Attempt["mode"],
      correct: r.correct as boolean,
      missedWords: (r.missed_words as string[]) ?? [],
      total: r.total as number,
      createdAt: new Date(r.created_at as string).getTime(),
    }));
  }
  return db().attempts.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function clearAttempts(): Promise<void> {
  if (useCloud()) {
    const sb = supabase()!;
    await sb.from("attempts").delete().eq("device_id", getDeviceId());
    return;
  }
  await db().attempts.clear();
}

/* ────────────── silsang_notes (실상 노트) ────────────── */

export async function addSilsangNote(n: NewSilsangNote): Promise<void> {
  const updatedAt = n.updatedAt ?? Date.now();
  if (useCloud()) {
    const sb = supabase()!;
    await sb.from("silsang_notes").insert({
      device_id: getDeviceId(),
      parable: n.parable,
      silsang: n.silsang,
      verse_ref: n.verseRef ?? null,
      note: n.note ?? null,
      updated_at: new Date(updatedAt).toISOString(),
    });
    return;
  }
  await db().silsangNotes.add({ ...n, updatedAt });
}

export async function listSilsangNotes(): Promise<SilsangNote[]> {
  if (useCloud()) {
    const sb = supabase()!;
    const { data } = await sb
      .from("silsang_notes")
      .select("*")
      .eq("device_id", getDeviceId())
      .order("updated_at", { ascending: false });
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as number,
      parable: r.parable as string,
      silsang: r.silsang as string,
      verseRef: (r.verse_ref as string | null) ?? undefined,
      note: (r.note as string | null) ?? undefined,
      updatedAt: new Date(r.updated_at as string).getTime(),
    }));
  }
  return db().silsangNotes.orderBy("updatedAt").reverse().toArray();
}

export async function deleteSilsangNote(id: number): Promise<void> {
  if (useCloud()) {
    const sb = supabase()!;
    await sb.from("silsang_notes").delete().eq("id", id).eq("device_id", getDeviceId());
    return;
  }
  await db().silsangNotes.delete(id);
}

/* ────────────── verse_images ────────────── */

export async function addVerseImage(i: NewVerseImage): Promise<void> {
  const createdAt = i.createdAt ?? Date.now();
  if (useCloud()) {
    const sb = supabase()!;
    await sb.from("verse_images").insert({
      device_id: getDeviceId(),
      chapter: i.chapter,
      verse: i.verse,
      url: i.url,
      prompt: i.prompt,
      style: i.style ?? null,
      seed: i.seed ?? null,
      created_at: new Date(createdAt).toISOString(),
    });
    return;
  }
  await db().verseImages.add({ ...i, createdAt });
}

export async function listVerseImages(chapter: number): Promise<VerseImage[]> {
  if (useCloud()) {
    const sb = supabase()!;
    const { data } = await sb
      .from("verse_images")
      .select("*")
      .eq("device_id", getDeviceId())
      .eq("chapter", chapter)
      .order("created_at", { ascending: false });
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as number,
      chapter: r.chapter as number,
      verse: r.verse as number,
      url: r.url as string,
      prompt: r.prompt as string,
      style: (r.style as string | null) ?? undefined,
      seed: (r.seed as number | null) ?? undefined,
      createdAt: new Date(r.created_at as string).getTime(),
    }));
  }
  return db()
    .verseImages.where("chapter")
    .equals(chapter)
    .reverse()
    .sortBy("createdAt");
}

export async function deleteVerseImage(id: number): Promise<void> {
  if (useCloud()) {
    const sb = supabase()!;
    await sb.from("verse_images").delete().eq("id", id).eq("device_id", getDeviceId());
    return;
  }
  await db().verseImages.delete(id);
}

/* ────────────── 백엔드 상태 ────────────── */

export function storageBackend(): "supabase" | "indexeddb" {
  return useCloud() ? "supabase" : "indexeddb";
}
