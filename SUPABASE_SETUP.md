# Supabase 연결 가이드 (5분)

데이터를 클라우드에 영구 저장하려면 아래 단계를 따르세요.
설정 안 해도 앱은 IndexedDB(브라우저 로컬)로 동작합니다.

---

## 1) Supabase 프로젝트 만들기

1. https://supabase.com 접속 → **Start your project** → GitHub/Google 로그인
2. **New project** 클릭
   - Name: `revelation-master` (자유)
   - Database Password: 안전한 비밀번호 (잘 보관 — 자주 안 쓰지만 필요할 때 있음)
   - Region: **Northeast Asia (Seoul)** 추천
   - Plan: **Free**
3. 프로젝트 생성 완료까지 1~2분 대기

## 2) 테이블 만들기

1. 좌측 메뉴 **SQL Editor** 클릭
2. **New query** 클릭
3. 프로젝트 폴더의 `supabase-schema.sql` 파일 전체 내용을 복사 → 붙여넣기
4. 우측 상단 **Run** (또는 ⌘+Enter)
5. "Success. No rows returned" 메시지 확인

## 3) API 키 복사

1. 좌측 메뉴 **Project Settings** (⚙ 아이콘) → **API**
2. 두 값을 복사:
   - **Project URL**: `https://xxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOi…` (긴 토큰)

## 4) 환경변수 설정

프로젝트 폴더 (`revelation-master/`)에 `.env.local` 파일을 만들고 아래 내용을 붙여넣기:

```bash
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_키_붙여넣기
```

## 5) 서버 재시작

```bash
# Ctrl+C 로 dev 서버 중지
npm run dev
```

브라우저에서 **http://localhost:3030/settings** 들어가서
**"☁️ Supabase (클라우드 동기화)"** 표시가 보이면 성공!

---

## 다른 기기에서도 데이터 공유

PC와 폰에서 같은 데이터를 보고 싶으면:

1. `/settings` 페이지에서 **사용자 코드**를 입력 (예: `ckh1996`)
2. 다른 기기에서도 같은 코드 입력
3. 새로고침하면 동일한 오답노트·실상 노트·이미지가 보임

⚠️ 이 코드는 비밀번호 역할이니 추측하기 어려운 값으로 정하세요.

---

## 무료 한도

- DB **500MB**
- 매주 한 번이라도 앱을 사용하면 **영구 무료**
- 7일 연속 미사용 시 일시정지(데이터는 남음, 클릭 한 번에 복구)
