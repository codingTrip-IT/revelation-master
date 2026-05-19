// 무료 이미지 생성: Pollinations.ai (API 키 불필요, 비용 0).
// URL을 만들어 <img src=...> 로 박으면 그 자리에서 생성·캐싱됨.

export type Style = "oil" | "watercolor" | "fresco" | "ethereal" | "minimal" | "ink";

export const STYLE_PRESETS: { id: Style; label: string; suffix: string }[] = [
  {
    id: "oil",
    label: "🖼 유화 (장엄)",
    suffix:
      "dramatic biblical oil painting, baroque lighting, chiaroscuro, golden light, museum quality",
  },
  {
    id: "watercolor",
    label: "💧 수채화 (부드러움)",
    suffix:
      "soft watercolor illustration, gentle pastel tones, ethereal, biblical scene, hand drawn",
  },
  {
    id: "fresco",
    label: "⛪ 프레스코 (성화)",
    suffix:
      "renaissance fresco painting style, religious art, byzantine influence, gold leaf accents",
  },
  {
    id: "ethereal",
    label: "✨ 영적 (몽환)",
    suffix:
      "ethereal heavenly vision, glowing light, celestial atmosphere, divine, surreal symbolic art",
  },
  {
    id: "minimal",
    label: "◻︎ 미니멀 (도식)",
    suffix:
      "minimal flat illustration, symbolic, simple shapes, clean composition, biblical iconography",
  },
  {
    id: "ink",
    label: "✒︎ 잉크 드로잉",
    suffix:
      "detailed ink line drawing, engraving style, religious illustration, black and white woodcut",
  },
];

const NEGATIVE = "no text, no letters, no watermark, no logo, no caption";

export function buildPrompt(opts: {
  chapter: number;
  verse: number;
  verseText: string;
  style: Style;
  addon?: string;
}): string {
  const preset = STYLE_PRESETS.find((s) => s.id === opts.style) ?? STYLE_PRESETS[0];
  const head = `Book of Revelation chapter ${opts.chapter} verse ${opts.verse} — `;
  const body = opts.verseText;
  const tail = `, ${preset.suffix}${opts.addon ? `, ${opts.addon}` : ""}, ${NEGATIVE}`;
  return head + body + tail;
}

export function imageUrl(prompt: string, seed: number, opts?: { w?: number; h?: number }) {
  const w = opts?.w ?? 1024;
  const h = opts?.h ?? 576;
  const enc = encodeURIComponent(prompt).replace(/%20/g, "%20");
  return `https://image.pollinations.ai/prompt/${enc}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true`;
}

export function newSeed() {
  return Math.floor(Math.random() * 1_000_000);
}
