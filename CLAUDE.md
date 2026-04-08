# CLAUDE.md

## Project Overview
Notion 기반 블로그 (morethan-log fork). Notion 데이터베이스에서 포스트를 가져와 Next.js로 정적 생성.

## Tech Stack
- Next.js 13 (Pages Router)
- notion-client v7 (unofficial Notion API)
- react-notion-x v7
- Emotion (CSS-in-JS)
- Vercel 배포

## Key Architecture
- `src/apis/notion-client/getPosts.ts` — Notion에서 포스트 목록 fetch
- `src/libs/utils/notion/getAllPageIds.ts` — collection_query 또는 block content에서 페이지 ID 추출
- `src/libs/utils/notion/getPageProperties.ts` — 블록에서 프로퍼티(제목, 날짜, 카테고리 등) 파싱
- `site.config.js` — 블로그 설정 (프로필, 테마, 플러그인)

## Notion API Caveats
- Notion API 응답 구조가 `value.value`로 이중 래핑됨 (2025년 변경)
- `collection_query`는 빈 객체 `{}`로 반환됨 → block content에서 페이지 ID를 fallback으로 가져옴
- notion-client v6은 자식 페이지 블록을 못 가져옴 → **반드시 v7 이상 사용**
- `getStaticProps`에서 `undefined`는 JSON 직렬화 불가 → `null`로 변환 필요

## Build & Deploy
- `yarn build` (Vercel에서 자동 실행)
- 환경변수: `NOTION_PAGE_ID` (Vercel에 설정)

## Commands
- `npm run dev` — 로컬 개발 서버
- `npm run build` — 프로덕션 빌드
