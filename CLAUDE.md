# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## This is NOT the Next.js you know

This project runs **Next.js 16**, which has breaking changes vs. your training data. Before touching routing, proxy/middleware, or config, check `node_modules/next/dist/docs/`. One concrete example already in this repo: `middleware.ts` is deprecated and renamed to `src/proxy.ts` (exported function is `proxy`, not `middleware`) — see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Overview

MeMento (「メメント」) is a personal record-keeping app:映画・小説・音楽の感想を「レビュー」として、日々の出来事を「ダイアリー」として、英語学習の成果を「英語学習ログ」として記録し、そこから拾った語彙・表現を「ワード」として蓄積する。目的は、インプット（鑑賞・読書・学習）を言語化してアウトプットする習慣をつけ、文章力・語彙力を高めること。full spec (用語定義・画面一覧・DB設計) is in [docs/spec.md](docs/spec.md), Japanese.

## Architecture

**Stack**: Next.js (App Router) + React 19 + TypeScript, Supabase (Postgres + Auth), Tailwind CSS v4, Anthropic SDK (Claude) for AI features, Azure Translator as a fallback translation provider.

**Auth flow**: `src/proxy.ts` runs on every request (excluding static assets), creates a Supabase server client from request cookies, and redirects unauthenticated users to `/login` unless the path is one of `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth`. Two separate Supabase client factories exist and must not be mixed up:
- `src/lib/supabase/client.ts` — browser client (`'use client'` components)
- `src/lib/supabase/server.ts` — server client bound to `next/headers` cookies (Server Components, Server Actions, `proxy.ts`)

**Route structure**: All authenticated pages live under the `src/app/(main)/` route group (shared `layout.tsx`), covering four content types — `reviews`, `diaries`, `english` (English learning logs), and `words` (vocabulary extracted from the other three) — plus `mypage`. Each content type follows the same convention:
- `page.tsx` — server component listing data, paired with a client `*List.tsx` for interactivity
- `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/...` — create/detail/edit routes
- `actions.ts` — colocated Server Actions (`'use server'`) doing the Supabase read/write for that route group; every mutation re-checks `supabase.auth.getUser()` and redirects to `/login` if absent (auth is not fully delegated to `proxy.ts`)
- `loading.tsx` — route-level loading UI

**Data model** (see `docs/spec.md` ER diagram): `reviews`, `diaries`, and `english_logs` each belong to a `user`; `words` records are optionally linked to one of the three via nullable FKs (`review_id` / `diary_id` / `english_log_id`) and carry a denormalized `genre` + `source_title` for display. When creating/updating a review/diary/log with attached vocabulary, the pattern is: upsert the parent row, then delete-and-reinsert its `words` rows (see `src/app/(main)/diaries/actions.ts`).

**AI features** (`src/lib/ai-actions.ts`, all Server Actions): calls `@anthropic-ai/sdk` directly with model `claude-haiku-4-5`.
- `proofreadText` — rewrites diary/review text for richer vocabulary, with separate ja/en system prompts per context (`diary` vs `review`); never alters tone/opinion/facts, returns only the corrected text.
- `translateTextClaude` — ja↔en translation tuned for diary writing (idiomatic, casual).
- `translateTextAzure` — same job via Azure Translator REST API (fallback/alternative provider, needs `AZURE_TRANSLATOR_KEY`/`AZURE_TRANSLATOR_REGION`).
- `checkEnglishText` — grammar-checks a user's English sentence, returns strict JSON (`hasErrors`/`corrected`/`translation`).
- `generateRecommendation` — samples the user's review history per genre, asks Claude for 4 recommendations as a JSON array, and upserts the result into `ai_recommendations` (keyed by `user_id`) for the mypage dashboard.

All these functions parse Claude's response defensively (strip ```json fences before `JSON.parse`) and return a `{ ok: true, ... } | { ok: false, error }` union instead of throwing — follow this pattern for new AI actions.

**Styling/theming**: Tailwind v4 with manual dark mode via a `dark` class on `<html>`, toggled by `src/components/ThemeProvider.tsx` and persisted to `localStorage`; an inline script in `src/app/layout.tsx` applies the class before hydration to avoid a flash. Color mappings per genre/language live in `src/lib/genre-colors.ts` — extend these maps rather than hardcoding Tailwind classes elsewhere. `reactCompiler: true` is enabled in `next.config.ts`, so avoid manual `useMemo`/`useCallback` unless there's a specific reason.

**Env vars** (`.env.local`, not committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`.
