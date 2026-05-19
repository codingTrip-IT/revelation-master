// Supabase 클라이언트 (싱글톤). 환경변수 없으면 null 반환.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!URL || !KEY) return null;
  if (!_client) {
    _client = createClient(URL, KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export function supabaseConfigured(): boolean {
  return !!(URL && KEY);
}

// 디바이스 고유 ID. 브라우저 로컬스토리지에 저장.
// 같은 ID로 로그인하면 어디서든 데이터 동기화 가능.
const DEVICE_KEY = "rm_device_id";
const DEVICE_OVERRIDE_KEY = "rm_user_code";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  // 사용자가 직접 설정한 user_code 우선 (여러 기기에서 같은 코드 쓰면 데이터 공유됨)
  const override = window.localStorage.getItem(DEVICE_OVERRIDE_KEY);
  if (override) return override;

  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function setUserCode(code: string | null) {
  if (typeof window === "undefined") return;
  if (code) window.localStorage.setItem(DEVICE_OVERRIDE_KEY, code);
  else window.localStorage.removeItem(DEVICE_OVERRIDE_KEY);
}

export function getUserCode(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEVICE_OVERRIDE_KEY);
}
