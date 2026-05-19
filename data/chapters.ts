export type ChapterMeta = {
  chapter: number;
  title: string;
  range?: string; // 예: "1:1~8"
  summary?: string;
  imageUrl?: string;
  keywords?: string[];
};

// 사용자가 제공한 22장(+ 1장 세분화) 개요
export const CHAPTERS: ChapterMeta[] = [
  { chapter: 1, range: "1:1~8", title: "계시록 전장의 요약과 결론" },
  { chapter: 1, range: "1:9~20", title: "계시록 사건의 시작과 일곱 별과 일곱 금 촛대의 비밀" },
  { chapter: 2, title: "일곱 교회 사자에게 보낸 편지" },
  { chapter: 3, title: "일곱 교회 사자에게 보낸 편지" },
  { chapter: 4, title: "영계 하나님의 보좌와 계열" },
  { chapter: 5, title: "일곱 인으로 봉한 책" },
  { chapter: 6, title: "배도한 선천 해·달·별에 대한 심판" },
  { chapter: 7, title: "새 창조 된 영적 새 이스라엘 열두 지파" },
  { chapter: 8, title: "마지막 인과 일곱 나팔" },
  { chapter: 9, title: "무저갱의 황충과 범죄한 천사" },
  { chapter: 10, title: "하늘에서 온 계시 책과 약속의 목자" },
  { chapter: 11, title: "두 증인과 일곱째 나팔" },
  { chapter: 12, title: "용과 하나님과의 전쟁" },
  { chapter: 13, title: "짐승에게 표 받고 배도한 선민" },
  { chapter: 14, title: "처음 익은 열매 시온산 십사만 사천" },
  { chapter: 15, title: "만국이 와서 경배할 증거장막 성전" },
  { chapter: 16, title: "진노의 일곱 대접" },
  { chapter: 17, title: "마귀의 양식 음행의 포도주" },
  { chapter: 18, title: "만국을 무너뜨린 사단과의 결혼" },
  { chapter: 19, title: "영육 어린양의 혼인 잔치" },
  { chapter: 20, title: "순교의 영과 산 자의 첫째 부활" },
  { chapter: 21, title: "약속한 새 하늘 새 땅 신천지" },
  { chapter: 22, title: "생명나무가 있는 거룩한 성" },
];

export const CHAPTER_COUNT = 22;
