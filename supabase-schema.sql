-- ============================================================
-- 계시록 마스터 — Supabase 스키마
-- 사용법: Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣고 Run
-- ============================================================

-- 1) 오답노트(시도 기록)
create table if not exists public.attempts (
  id           bigserial primary key,
  device_id    text not null,
  chapter      int  not null,
  verse        int  not null,
  mode         text not null,
  correct      boolean not null,
  missed_words text[] not null default '{}',
  total        int  not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists attempts_device_idx
  on public.attempts (device_id, created_at desc);

-- 2) 실상 노트 (사용자 입력 비유→실상 매핑)
create table if not exists public.silsang_notes (
  id          bigserial primary key,
  device_id   text not null,
  parable     text not null,
  silsang     text not null,
  verse_ref   text,
  note        text,
  updated_at  timestamptz not null default now()
);
create index if not exists silsang_notes_device_idx
  on public.silsang_notes (device_id, updated_at desc);

-- 3) 절별 생성 이미지
create table if not exists public.verse_images (
  id          bigserial primary key,
  device_id   text not null,
  chapter     int  not null,
  verse       int  not null,
  url         text not null,
  prompt      text,
  style       text,
  seed        int,
  created_at  timestamptz not null default now()
);
create index if not exists verse_images_device_idx
  on public.verse_images (device_id, chapter, created_at desc);

-- ============================================================
-- RLS (Row Level Security)
-- 솔로 사용이라 단순 정책: anon 키 가진 누구든 자기 device_id 행만 조작 가능
-- ============================================================
alter table public.attempts        enable row level security;
alter table public.silsang_notes   enable row level security;
alter table public.verse_images    enable row level security;

-- 공개 읽기/쓰기 정책 (device_id 검사는 클라이언트에서)
drop policy if exists "anon all attempts"     on public.attempts;
drop policy if exists "anon all silsang"      on public.silsang_notes;
drop policy if exists "anon all images"       on public.verse_images;

create policy "anon all attempts"
  on public.attempts for all
  using (true) with check (true);

create policy "anon all silsang"
  on public.silsang_notes for all
  using (true) with check (true);

create policy "anon all images"
  on public.verse_images for all
  using (true) with check (true);
