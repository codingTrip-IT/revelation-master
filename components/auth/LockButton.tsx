"use client";

import { lockNow } from "./PinGate";

export default function LockButton() {
  if (!process.env.NEXT_PUBLIC_APP_PIN) return null;
  return (
    <button
      onClick={lockNow}
      title="잠그기"
      className="text-slate-400 hover:text-sky-700"
    >
      🔒
    </button>
  );
}
