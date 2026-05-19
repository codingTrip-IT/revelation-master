// 비유 ↔ 실상 매핑 (사전 입력 + 사용자 입력 둘 다 지원)
// 사용자 입력은 IndexedDB(Dexie)에 별도 저장됨. 여기엔 출발용 프리셋만.

export type SilsangEntry = {
  parable: string; // 비유 (성경 표현)
  silsang: string; // 실상 (대응 의미)
  verseRefs?: string[]; // 예: ["계1:20", "계2:1"]
  note?: string;
};

export const PRESET_SILSANG: SilsangEntry[] = [
  { parable: "일곱 별", silsang: "일곱 교회의 사자(목자)", verseRefs: ["계1:20"] },
  { parable: "일곱 금 촛대", silsang: "일곱 교회", verseRefs: ["계1:20"] },
  { parable: "이긴 자", silsang: "약속의 목자(계시 받은 자)", verseRefs: ["계2:7", "계3:21"] },
  { parable: "보좌", silsang: "하나님의 통치(영계)", verseRefs: ["계4:2"] },
  { parable: "네 생물", silsang: "보좌 주위의 네 영", verseRefs: ["계4:6"] },
  { parable: "이십사 장로", silsang: "영계의 24 장로", verseRefs: ["계4:4"] },
  { parable: "일곱 인으로 봉한 책", silsang: "감추인 계시의 말씀(요한계시록)", verseRefs: ["계5:1"] },
  { parable: "어린양", silsang: "예수님", verseRefs: ["계5:6"] },
  { parable: "해·달·별", silsang: "선천 영적 이스라엘의 지도자들", verseRefs: ["계6:12-13"] },
  { parable: "십사만 사천", silsang: "새 이스라엘 열두 지파(첫 열매)", verseRefs: ["계7:4", "계14:1"] },
  { parable: "일곱 나팔", silsang: "심판과 증거의 일곱 사자", verseRefs: ["계8:2"] },
  { parable: "황충", silsang: "범죄한 영들", verseRefs: ["계9:3"] },
  { parable: "작은 책", silsang: "펼쳐진 계시의 말씀", verseRefs: ["계10:2"] },
  { parable: "두 증인", silsang: "두 감람나무와 두 촛대", verseRefs: ["계11:3-4"] },
  { parable: "용", silsang: "옛 뱀, 마귀, 사단", verseRefs: ["계12:9"] },
  { parable: "짐승", silsang: "용에게 권세 받은 멸망자 조직", verseRefs: ["계13:1-2"] },
  { parable: "시온산", silsang: "약속한 추수의 장소", verseRefs: ["계14:1"] },
  { parable: "증거장막 성전", silsang: "약속의 성취 성전", verseRefs: ["계15:5"] },
  { parable: "일곱 대접", silsang: "마지막 진노의 심판", verseRefs: ["계16:1"] },
  { parable: "음녀 바벨론", silsang: "큰 성, 영적 음행의 도성", verseRefs: ["계17:5", "계18:2"] },
  { parable: "어린양의 혼인 잔치", silsang: "영육 합일의 잔치", verseRefs: ["계19:7-9"] },
  { parable: "첫째 부활", silsang: "순교자의 영이 함께한 산 자", verseRefs: ["계20:5-6"] },
  { parable: "새 하늘 새 땅", silsang: "약속한 신천지", verseRefs: ["계21:1"] },
  { parable: "생명나무", silsang: "계시의 말씀(생명의 양식)", verseRefs: ["계22:2"] },
];
