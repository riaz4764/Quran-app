# Quran — Offline Quran App

A 100% offline Android/iOS Quran application with Arabic text, English and Urdu translations, premium dark UI, and zero ads.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Expo app: start via the `artifacts/quran-app: expo` workflow

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) + Expo Router
- Fonts: Inter (UI) + Amiri (Arabic calligraphy)
- Persistence: @react-native-async-storage/async-storage (bookmarks + settings)
- API: Express 5 (api-server, unused for Quran app)

## Where things live

- `artifacts/quran-app/` — Expo app (the Quran reader)
- `artifacts/quran-app/assets/data/arabic.json` — Quran Arabic text (Uthmani Hafs, fawazahmed0)
- `artifacts/quran-app/assets/data/english.json` — English translation (Hilali-Khan, alquran.cloud)
- `artifacts/quran-app/assets/data/urdu.json` — Urdu translation (Jalandhry, alquran.cloud)
- `artifacts/quran-app/utils/quranData.ts` — data loading & normalization layer
- `artifacts/quran-app/context/QuranContext.tsx` — font size & translation toggle settings
- `artifacts/quran-app/context/BookmarkContext.tsx` — bookmark state + AsyncStorage

## Architecture decisions

- All Quran data (~8MB JSON) is bundled at build time; zero network calls at runtime → fully offline
- Arabic and English/Urdu data use two different formats (fawazahmed0 flat array vs alquran.cloud nested surahs); the `quranData.ts` utility normalizes both into a unified API at first access
- Dark-only theme (no light mode) — enforced in `app.json` (`userInterfaceStyle: "dark"`) and `useColors()` always returns `colors.dark`
- FlatList with `initialNumToRender: 10` and `windowSize: 5` keeps the surah reader smooth on large surahs (Al-Baqara: 286 ayahs)
- No backend dependency for core app; api-server exists in the monorepo but is not used by the Quran app

## Product

- **Surah List** — browse all 114 surahs, search by name or number
- **Surah Reader** — large Amiri Arabic font, English + Urdu translations per ayah, bookmarking
- **Search** — full-text search across Arabic, English, and Urdu text (up to 100 results)
- **Bookmarks** — saved ayahs with quick navigation back to the surah
- **Settings** — adjust Arabic/translation font sizes, toggle English/Urdu translations

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do not rename the data files in `assets/data/` — they are required by Metro bundler at build time
- Arabic data format: `{ quran: [{ chapter, verse, text }] }` (fawazahmed0 flat)
- English/Urdu data format: `{ data: { surahs: [{ number, ayahs: [{ numberInSurah, text }] }] } }` (alquran.cloud nested)
- Arabic names from alquran.cloud include "سُورَةُ" prefix — strip it with `.replace(/^سُورَةُ\s+/, "")` before display
- Surah 9 (At-Tawbah) does not begin with Bismillah — this is handled in `app/surah/[id].tsx`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
