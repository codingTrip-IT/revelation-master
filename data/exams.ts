// 시험 대비 자료: 절 본문 + 번호 주석(주제어/풀이/하위 항목).
// 화면에서 주석을 가렸다 펼쳤다 할 수 있고, 문제처럼 풀 수도 있게 구조화.

export type ExamSegment =
  | { kind: "text"; text: string }
  | { kind: "mark"; num: number; text: string };

export type ExamAnnotation = {
  num: number;
  phrase: string; // 주석의 헤더 (본문에 표시된 어구)
  term?: string; // 괄호 안의 부제 (예: "인을 떼는 것")
  explanation?: string; // 한 줄 풀이
  subPoints?: string[]; // 하위 불릿 (각 줄 자유 텍스트)
  memorizeOnly?: boolean; // "성구 암기만" 표기
};

export type ExamVerse = {
  verse: number;
  segments: ExamSegment[];
  annotations: ExamAnnotation[];
};

export type Exam = {
  id: string;
  chapter: number;
  title: string; // 예: "계 6장  배도한 선천 해·달·별에 대한 심판"
  verses: ExamVerse[];
};

// 작성 도우미
const t = (text: string): ExamSegment => ({ kind: "text", text });
const m = (num: number, text: string): ExamSegment => ({ kind: "mark", num, text });

export const EXAMS: Exam[] = [
  {
    id: "ch6",
    chapter: 6,
    title: "계 6장  배도한 선천 해·달·별에 대한 심판",
    verses: [
      {
        verse: 1,
        segments: [
          t("내가 보매 어린 양이 "),
          m(1, "일곱 인 중에 하나를 떼시는 그 때"),
          t("에 내가 들으니 네 생물 중에 하나가 우뢰소리 같이 말하되 오라 하기로"),
        ],
        annotations: [
          {
            num: 1,
            phrase: "일곱 인 중에 하나를 떼시는 그 때",
            term: "인을 떼는 것",
            explanation: "책의 내용을 이루어 예언의 실체들이 나타나게 되는 것",
          },
        ],
      },
      {
        verse: 2,
        segments: [
          t("내가 이에 보니 "),
          m(1, "흰 말이 있는데 그 탄 자"),
          t("가 "),
          m(2, "활"),
          t("을 가졌고 면류관을 받고 나가서 "),
          m(3, "이기고 또 이기려고 하더라"),
        ],
        annotations: [
          {
            num: 1,
            phrase: "흰 말이 있는데 그 탄 자",
            term: "말과 탄자",
            explanation: "육체들과 영들",
          },
          { num: 2, phrase: "활", explanation: "심판의 말씀" },
          {
            num: 3,
            phrase: "이기고 또 이기려고 하더라",
            subPoints: [
              "이기신 것: 초림 때 세상을 주관하는 마귀와 싸워 승리하신 것(요 16:33)",
              "이기려고 함: 계시록 성취 때에도 마귀와 싸워 이기려 한다는 것",
            ],
          },
        ],
      },
      {
        verse: 3,
        segments: [t("둘째 인을 떼실 때에 내가 들으니 둘째 생물이 말하되 오라 하더니")],
        annotations: [],
      },
      {
        verse: 4,
        segments: [
          t("이에 ("),
          m(1, "붉은 다른 말"),
          t(")이 나오더라 그 탄 자가 "),
          m(2, "허락"),
          t("을 받아 "),
          m(3, "땅"),
          t("에서 "),
          m(4, "화평을 제하여 버리며 서로 죽이게 하고"),
          t(" 또 "),
          m(5, "큰 칼"),
          t("을 받았더라"),
        ],
        annotations: [
          { num: 1, phrase: "붉은 다른 말", memorizeOnly: true },
          {
            num: 2,
            phrase: "허락",
            explanation: "땅에 거한 자들로 화평을 제하여 서로 죽이게 하는 것",
          },
          { num: 3, phrase: "땅", explanation: "배도한 일곱 금 촛대 장막의 성도들" },
          {
            num: 4,
            phrase: "화평을 제하여 버리며 서로 죽이게 하고",
            explanation:
              "시험에 빠져 서로 미워하게 하고 거짓 목자(니골라당)에게 내어주며 서로의 영을 해하는 것",
          },
          { num: 5, phrase: "큰 칼", explanation: "심판의 말씀" },
        ],
      },
      {
        verse: 5,
        segments: [
          t(
            "세째 인을 떼실 때에 내가 들으니 세째 생물이 말하되 오라 하기로 내가 보니 ("
          ),
          m(1, "검은 말"),
          t(")이 나오는데 그 탄 자가 손에 "),
          m(2, "저울"),
          t("을 가졌더라"),
        ],
        annotations: [
          { num: 1, phrase: "검은 말", memorizeOnly: true },
          { num: 2, phrase: "저울", explanation: "믿음과 행실을 달아보는 하나님 말씀" },
        ],
      },
      {
        verse: 6,
        segments: [
          t("내가 네 생물 사이로서 나는듯하는 음성을 들으니 가로되 "),
          m(1, "한 데나리온에 밀 한되요 한 데나리온에 보리 석되로다"),
          t(" 또 "),
          m(2, "감람유와 포도주는 해치 말라"),
          t(" 하더라"),
        ],
        annotations: [
          {
            num: 1,
            phrase: "한 데나리온에 밀 한되, 보리 석되",
            explanation:
              "배도한 장막 가운데서 주님의 말씀으로 믿음과 행실을 달아 건진 자들(믿음의 씨로 남은 성도)이 적다는 것",
            subPoints: ["한 데나리온: 변치 않는 주님의 말씀"],
          },
          {
            num: 2,
            phrase: "감람유와 포도주는 해치 말라",
            subPoints: [
              "감람유: 증인의 말씀(계 11:3-4)",
              "포도주: 예수님의 말씀(요 15:1)",
            ],
          },
        ],
      },
      {
        verse: 7,
        segments: [
          t("네째 인을 떼실 때에 내가 네째 생물의 음성을 들으니 가로되 오라 하기로"),
        ],
        annotations: [],
      },
      {
        verse: 8,
        segments: [
          t("내가 보매 ("),
          m(1, "청황색 말"),
          t(")이 나오는데 그 "),
          m(2, "탄 자의 이름은 사망"),
          t("이니 "),
          m(3, "음부가 그 뒤를 따르더라"),
          t(" 저희가 "),
          m(4, "땅 사분 일의 권세"),
          t("를 얻어 "),
          m(5, "검과 흉년과 사망과 땅의 짐승"),
          t("으로써 죽이더라"),
        ],
        annotations: [
          { num: 1, phrase: "청황색 말", memorizeOnly: true },
          { num: 2, phrase: "탄 자의 이름은 사망", explanation: "죽이는 명을 받았기 때문" },
          {
            num: 3,
            phrase: "음부가 그 뒤를 따르더라",
            explanation: "영적으로 죽임당한 자들을 지옥으로 데려가기 위함",
          },
          {
            num: 4,
            phrase: "땅 사분 일의 권세",
            explanation: "배도한 일곱 금 촛대 장막 성도들 1/4의 영을 죽이는 권한",
          },
          {
            num: 5,
            phrase: "검과 흉년과 사망과 땅의 짐승",
            subPoints: [
              "검: 심판의 말씀",
              "흉년: 영적인 빈곤(암 8:11)",
              "사망: 영을 죽이는 것",
              "땅의 짐승: 음부에 속한 멸망자(계 13장)  *실상: 뱀 씨(가명)",
            ],
          },
        ],
      },
    ],
  },
];

export function getExam(id: string) {
  return EXAMS.find((e) => e.id === id);
}
