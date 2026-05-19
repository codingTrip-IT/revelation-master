import { PRESET_SILSANG } from "@/data/silsang";
import SilsangBoard from "@/components/silsang/SilsangBoard";

export default function SilsangPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">실상 카드</h1>
        <p className="text-slate-600 text-sm mt-1">
          비유 ↔ 실상을 매칭해서 외웁니다. 카드 클릭 시 실상이 펼쳐지고, 직접 메모도 남길 수 있어요.
        </p>
      </div>
      <SilsangBoard presets={PRESET_SILSANG} />
    </div>
  );
}
