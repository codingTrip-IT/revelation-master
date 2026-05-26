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
  /** 절별 장 (옵션). 없으면 exam.chapter 사용. 다장(多章) 시험에서 사용. */
  chapter?: number;
  segments: ExamSegment[];
  annotations: ExamAnnotation[];
};

export type TestMode = "title" | "blank" | "anno" | "fullText";

export type Exam = {
  id: string;
  chapter: number; // 대표 장 (다장 시험은 0)
  title: string;
  /** 전문 쓰기 시험 모드를 기본/유일 시험으로 사용 */
  fullTextMode?: boolean;
  /** 표시할 시험 모드 화이트리스트. 미지정 시 전부 노출. */
  testModes?: TestMode[];
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

  /* ─────────── 5/31 대비 — 1유형 (전문 쓰기) ─────────── */
  {
    id: "5-31-type1",
    chapter: 0,
    title: "5/31 시험 · 1유형 (전문 쓰기)",
    fullTextMode: true,
    testModes: ["fullText"],
    verses: [
      {
        chapter: 7,
        verse: 1,
        segments: [
          t(
            "이 일 후에 내가 네 천사가 땅 네 모퉁이에 선 것을 보니 땅의 사방의 바람을 붙잡아 바람으로 하여금 땅에나 바다에나 각종 나무에 불지 못하게 하더라"
          ),
        ],
        annotations: [],
      },
      {
        chapter: 7,
        verse: 2,
        segments: [
          t(
            "또 보매 다른 천사가 살아 계신 하나님의 인을 가지고 해 돋는 데로부터 올라와서 땅과 바다를 해롭게 할 권세를 얻은 네 천사를 향하여 큰 소리로 외쳐"
          ),
        ],
        annotations: [],
      },
      {
        chapter: 7,
        verse: 3,
        segments: [
          t(
            "가로되 우리가 우리 하나님의 종들의 이마에 인치기까지 땅이나 바다나 나무나 해하지 말라 하더라"
          ),
        ],
        annotations: [],
      },
      {
        chapter: 7,
        verse: 4,
        segments: [
          t(
            "내가 인 맞은 자의 수를 들으니 이스라엘 자손의 각 지파 중에서 인 맞은 자들이 십사만 사천이니"
          ),
        ],
        annotations: [],
      },
      {
        chapter: 10,
        verse: 10,
        segments: [
          t(
            "내가 천사의 손에서 작은 책을 갖다 먹어버리니 내 입에는 꿀같이 다나 먹은 후에 내 배에서는 쓰게 되더라"
          ),
        ],
        annotations: [],
      },
      {
        chapter: 10,
        verse: 11,
        segments: [
          t(
            "저가 내게 말하기를 네가 많은 백성과 나라와 방언과 임금에게 다시 예언하여야 하리라 하더라"
          ),
        ],
        annotations: [],
      },
    ],
  },

  /* ─────────── 5/31 대비 — 2유형 (괄호 채우기) ─────────── */
  {
    id: "5-31-type2",
    chapter: 0,
    title: "5/31 시험 · 2유형 (괄호 채우기)",
    testModes: ["blank"],
    verses: [
      {
        chapter: 1,
        verse: 1,
        segments: [
          m(1, "예수 그리스도의 계시"),
          t("라 이는 하나님이 그에게 주사 "),
          m(2, "반드시 속히 될 일"),
          t("을 그 "),
          m(3, "종들"),
          t("에게 보이시려고 그 천사를 그 종 "),
          m(4, "요한"),
          t("에게 보내어 지시하신 것이라"),
        ],
        annotations: [],
      },
      {
        chapter: 1,
        verse: 2,
        segments: [
          t("요한은 "),
          m(1, "하나님의 말씀"),
          t("과 "),
          m(2, "예수 그리스도의 증거"),
          t(" 곧 "),
          m(3, "자기의 본 것"),
          t("을 다 "),
          m(4, "증거"),
          t("하였느니라"),
        ],
        annotations: [],
      },
      {
        chapter: 1,
        verse: 3,
        segments: [
          t("이 "),
          m(1, "예언의 말씀"),
          t("을 "),
          m(2, "읽는 자"),
          t("와 "),
          m(3, "듣는 자들"),
          t("과 그 가운데 "),
          m(4, "기록한 것을 지키는 자들"),
          t("이 "),
          m(5, "복"),
          t("이 있나니 때가 가까움이라"),
        ],
        annotations: [],
      },
      {
        chapter: 20,
        verse: 4,
        segments: [
          t("또 내가 "),
          m(1, "보좌들"),
          t("을 보니 거기 "),
          m(2, "앉은 자들"),
          t("이 있어 "),
          m(3, "심판하는 권세"),
          t("를 받았더라 또 내가 보니 "),
          m(4, "예수의 증거"),
          t("와 "),
          m(5, "하나님의 말씀"),
          t("을 인하여 "),
          m(6, "목 베임을 받은 자의 영혼들"),
          t("과 또 "),
          m(7, "짐승과 그의 우상에게 경배"),
          t("하지도 아니하고 "),
          m(8, "이마와 손에 그의 표"),
          t("를 받지도 아니한 자들이 "),
          m(9, "살아서"),
          t(" 그리스도로 더불어 "),
          m(10, "천 년 동안 왕 노릇"),
          t(" 하니"),
        ],
        annotations: [],
      },
      {
        chapter: 20,
        verse: 5,
        segments: [
          m(1, "그 나머지 죽은 자들은 그 천 년이 차기까지 살지 못하더라"),
          t(" 이는 "),
          m(2, "첫째 부활"),
          t("이라"),
        ],
        annotations: [],
      },
      {
        chapter: 20,
        verse: 6,
        segments: [
          t("이 "),
          m(1, "첫째 부활"),
          t("에 참예하는 자들은 복이 있고 거룩하도다 "),
          m(2, "둘째 사망"),
          t("이 그들을 다스리는 권세가 없고 도리어 그들이 하나님과 그리스도의 "),
          m(3, "제사장"),
          t("이 되어 "),
          m(4, "천 년 동안"),
          t(" 그리스도로 더불어 "),
          m(5, "왕 노릇"),
          t(" 하리라"),
        ],
        annotations: [],
      },
      {
        chapter: 22,
        verse: 18,
        segments: [
          t("내가 이 책의 "),
          m(1, "예언의 말씀"),
          t("을 듣는 각인에게 증거하노니 만일 누구든지 이것들 외에 더하면 하나님이 이 책에 기록된 "),
          m(2, "재앙들"),
          t("을 그에게 더하실 터이요"),
        ],
        annotations: [],
      },
      {
        chapter: 22,
        verse: 19,
        segments: [
          t(
            "만일 누구든지 이 책의 예언의 말씀에서 제하여 버리면 하나님이 이 책에 기록된 "
          ),
          m(1, "생명나무와 및 거룩한 성에 참예함"),
          t("을 제하여 버리시리라"),
        ],
        annotations: [],
      },
    ],
  },
];

// 절의 전체 본문 텍스트 (전문 쓰기 시험의 정답으로 사용)
export function verseFullText(v: ExamVerse): string {
  return v.segments.map((s) => s.text).join("");
}

export function getExam(id: string) {
  return EXAMS.find((e) => e.id === id);
}
