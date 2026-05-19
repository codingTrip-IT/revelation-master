import raw from "./revelation.json";

export type Verse = { chapter: number; verse: number; text: string };

const data = raw as Record<string, Verse[]>;

export function getChapter(ch: number): Verse[] {
  return data[String(ch)] ?? [];
}

export function getVerse(ch: number, v: number): Verse | undefined {
  return getChapter(ch).find((x) => x.verse === v);
}

export function chapterVerseCount(ch: number): number {
  return getChapter(ch).length;
}

export const ALL_CHAPTERS = Object.keys(data)
  .map((n) => parseInt(n, 10))
  .sort((a, b) => a - b);
