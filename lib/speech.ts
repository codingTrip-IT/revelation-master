// Web Speech API wrapper — Korean TTS + STT.
// 브라우저 환경 전용. SSR-safe하게 가드.

export function speechSupported() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

export function recognitionSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export type SpeakOptions = {
  rate?: number; // 0.1 ~ 10 (보통 0.9~1.1)
  pitch?: number; // 0~2
  lang?: string; // 기본 ko-KR
  onEnd?: () => void;
};

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang ?? "ko-KR";
  u.rate = opts.rate ?? 0.95;
  u.pitch = opts.pitch ?? 1;
  if (opts.onEnd) u.onend = opts.onEnd;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
}

export type ListenHandle = { stop: () => void };

type SpeechResult = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechResult) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

export function listen(
  onResult: (text: string, isFinal: boolean) => void,
  callbacks: {
    onEnd?: () => void;
    onError?: (err: string) => void;
  } = {},
  opts: { lang?: string; continuous?: boolean } = {}
): ListenHandle | null {
  if (!recognitionSupported()) return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = opts.lang ?? "ko-KR";
  rec.interimResults = true;
  rec.continuous = opts.continuous ?? false;
  rec.maxAlternatives = 1;

  rec.onresult = (e) => {
    let text = "";
    let isFinal = false;
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      text += r[0].transcript;
      if (r.isFinal) isFinal = true;
    }
    onResult(text, isFinal);
  };
  rec.onend = () => callbacks.onEnd?.();
  rec.onerror = (e) => callbacks.onError?.(e.error);

  try {
    rec.start();
  } catch (err) {
    callbacks.onError?.(String(err));
    return null;
  }

  return { stop: () => rec.stop() };
}

// 음성 결과에서 빈칸 답을 찾는 fuzzy matcher.
// 정규화: 공백/문장부호 제거.
export function normalize(s: string): string {
  return s.replace(/\s+/g, "").replace(/[.,!?;:'"“”‘’()\[\]·…~∼]/g, "");
}

// 인식된 텍스트 안에 정답 문자열이 포함되어 있는지 (정규화 기준)
export function containsAnswer(spoken: string, answer: string): boolean {
  const sp = normalize(spoken);
  const an = normalize(answer);
  if (!an) return false;
  return sp.includes(an);
}
