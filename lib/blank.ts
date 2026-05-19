// 빈칸 생성 로직: 한글 텍스트를 어절 단위로 끊고 일부를 빈칸으로.

export type BlankMode = "easy" | "medium" | "hard" | "first";

export type BlankToken =
  | { kind: "word"; text: string; index: number; blank: boolean; firstChar: string }
  | { kind: "space"; text: string };

// 어절 단위 분리 (공백 보존)
export function tokenize(text: string): BlankToken[] {
  const tokens: BlankToken[] = [];
  const re = /(\S+)|(\s+)/g;
  let m: RegExpExecArray | null;
  let wordIdx = 0;
  while ((m = re.exec(text))) {
    if (m[1]) {
      const w = m[1];
      tokens.push({
        kind: "word",
        text: w,
        index: wordIdx++,
        blank: false,
        firstChar: w[0] ?? "",
      });
    } else if (m[2]) {
      tokens.push({ kind: "space", text: m[2] });
    }
  }
  return tokens;
}

// 결정적 시드 기반 셔플 (절마다 같은 빈칸 패턴이 나오게)
function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function makeBlanks(text: string, mode: BlankMode, seed: number): BlankToken[] {
  const tokens = tokenize(text);
  const words = tokens.filter((t): t is Extract<BlankToken, { kind: "word" }> => t.kind === "word");

  if (mode === "first") {
    for (const w of words) w.blank = true;
    return tokens;
  }

  const ratio = mode === "easy" ? 0.2 : mode === "medium" ? 0.35 : 0.55;
  const targetCount = Math.max(1, Math.round(words.length * ratio));

  const rand = seededRandom(seed);
  const indices = words.map((_, i) => i);
  // Fisher-Yates
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const chosen = new Set(indices.slice(0, targetCount));
  words.forEach((w, i) => {
    w.blank = chosen.has(i);
  });
  return tokens;
}

// 정답 비교: 공백/문장부호 무시
export function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, "").replace(/[.,!?;:'"“”‘’()\[\]·…]/g, "");
}

export function isCorrect(input: string, answer: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(answer);
}
