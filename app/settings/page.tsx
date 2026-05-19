import SettingsView from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-slate-600 text-sm mt-1">
          저장소 상태 확인 / 사용자 코드(다른 기기와 데이터 공유) 관리.
        </p>
      </div>
      <SettingsView />
    </div>
  );
}
