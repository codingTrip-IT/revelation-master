// 큐레이션된 빈칸 문제 (랜덤 빈칸이 아닌, 핵심 구절만 정확히 빈칸 처리)

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "blank"; num: number; answer: string; alts?: string[] };

export type QuizVerse = {
  verse: number;
  segments: Segment[];
};

export type Quiz = {
  id: string; // 예: "1-1-8"
  chapter: number;
  range: string; // 예: "1:1~8"
  title: string;
  verses: QuizVerse[];
};

// 작성 도우미: t = 텍스트, b = 빈칸
const t = (text: string): Segment => ({ kind: "text", text });
const b = (num: number, answer: string, alts?: string[]): Segment => ({
  kind: "blank",
  num,
  answer,
  alts,
});

export const QUIZZES: Quiz[] = [
  {
    id: "1-1-8",
    chapter: 1,
    range: "1:1~8",
    title: "계시록 전장의 요약과 결론",
    verses: [
      {
        verse: 1,
        segments: [
          t(""),
          b(1, "예수 그리스도의 계시"),
          t("라 이는 하나님이 그에게 주사 "),
          b(2, "반드시 속히 될 일"),
          t("을 그 "),
          b(3, "종들"),
          t("에게 보이시려고 그 천사를 그 종 요한에게 보내어 지시하신 것이라"),
        ],
      },
      {
        verse: 2,
        segments: [
          t("요한은 "),
          b(4, "하나님의 말씀"),
          t("과 "),
          b(5, "예수 그리스도의 증거"),
          t(" 곧 "),
          b(6, "자기의 본 것"),
          t("을 다 증거하였느니라"),
        ],
      },
      {
        verse: 3,
        segments: [
          t("이 "),
          b(7, "예언의 말씀"),
          t("을 "),
          b(8, "읽는 자"),
          t("와 "),
          b(9, "듣는 자들"),
          t("과 그 가운데 기록한 것을 "),
          b(10, "지키는 자들"),
          t("이 복이 있나니 때가 가까움이라"),
        ],
      },
      {
        verse: 4,
        segments: [
          t("요한은 "),
          b(11, "아시아에 있는 일곱 교회"),
          t("에 편지하노니 이제도 계시고 전에도 계시고 "),
          b(12, "장차 오실 이"),
          t("와 그 "),
          b(13, "보좌 앞에 일곱 영"),
          t("과"),
        ],
      },
      {
        verse: 5,
        segments: [
          t(
            "또 충성된 증인으로 죽은 자들 가운데서 먼저 나시고 땅의 임금들의 머리가 되신 예수 그리스도로 말미암아 은혜와 평강이 너희에게 있기를 원하노라 우리를 사랑하사 "
          ),
          b(14, "그의 피로 우리 죄에서 우리를 해방"),
          t("하시고"),
        ],
      },
      {
        verse: 6,
        segments: [
          t("그 아버지 하나님을 위하여 우리를 "),
          b(15, "나라와 제사장"),
          t("으로 삼으신 그에게 영광과 능력이 세세토록 있기를 원하노라 아멘"),
        ],
      },
      {
        verse: 7,
        segments: [
          t("볼찌어다 "),
          b(16, "구름을 타고 오시리라"),
          t(" 각인의 눈이 그를 보겠고 그를 "),
          b(17, "찌른 자들"),
          t("도 볼터이요 땅에 있는 "),
          b(18, "모든 족속"),
          t("이 그를 인하여 애곡하리니 그러하리라 아멘"),
        ],
      },
      {
        verse: 8,
        segments: [
          t("주 하나님이 가라사대 나는 "),
          b(19, "알파와 오메가"),
          t("라 이제도 있고 전에도 있었고 장차 올 자요 전능한 자라 하시더라"),
        ],
      },
    ],
  },
];

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}
