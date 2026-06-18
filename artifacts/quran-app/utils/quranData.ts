import type { AyahData, JuzMeta, SurahMeta } from "@/types/quran";
import type { QuranRawData, RawSurah } from "./quranLoader.types";
import { loadQuranRawData } from "./quranLoader";

let _raw: QuranRawData | null = null;
let _arabicMap: Map<string, string> | null = null;
let _surahs: SurahMeta[] | null = null;
let _englishByKey: Map<string, string> | null = null;
let _urduByKey: Map<string, string> | null = null;
let _rukoByKey: Map<string, number> | null = null;
let _juzByKey: Map<string, number> | null = null;
let _pageByKey: Map<string, number> | null = null;
let _juzList: JuzMeta[] | null = null;

let _initPromise: Promise<void> | null = null;

const JUZ_ARABIC_NAMES: Record<number, string> = {
  1: "الم",
  2: "سَيَقُولُ",
  3: "تِلْكَ الرُّسُلُ",
  4: "لَنْ تَنَالُوا",
  5: "وَالْمُحْصَنَاتُ",
  6: "لَا يُحِبُّ اللَّهُ",
  7: "وَإِذَا سَمِعُوا",
  8: "وَلَوْ أَنَّنَا",
  9: "قَالَ الْمَلَأُ",
  10: "وَاعْلَمُوا",
  11: "يَعْتَذِرُونَ",
  12: "وَمَا مِنْ دَابَّةٍ",
  13: "وَمَا أُبَرِّئُ",
  14: "رُبَمَا",
  15: "سُبْحَانَ الَّذِي",
  16: "قَالَ أَلَمْ أَقُلْ",
  17: "اقْتَرَبَ",
  18: "قَدْ أَفْلَحَ",
  19: "وَقَالَ الَّذِينَ",
  20: "أَمَّنْ خَلَقَ",
  21: "اتْلُ مَا أُوحِيَ",
  22: "وَمَنْ يَقْنُتْ",
  23: "وَمَا لِيَ",
  24: "فَمَنْ أَظْلَمُ",
  25: "إِلَيْهِ يُرَدُّ",
  26: "حم",
  27: "قَالَ فَمَا خَطْبُكُمْ",
  28: "قَدْ سَمِعَ اللَّهُ",
  29: "تَبَارَكَ الَّذِي",
  30: "عَمَّ يَتَسَاءَلُونَ",
};

function buildMaps(raw: QuranRawData): void {
  _arabicMap = new Map();
  for (const v of raw.arabic.quran) {
    _arabicMap.set(`${v.chapter}:${v.verse}`, v.text);
  }

  _englishByKey = new Map();
  _urduByKey = new Map();
  _rukoByKey = new Map();
  _juzByKey = new Map();
  _pageByKey = new Map();

  const juzFirstSeen = new Map<number, { surahNumber: number; ayahNumber: number }>();

  for (const s of raw.english.data.surahs) {
    for (const a of s.ayahs) {
      const key = `${s.number}:${a.numberInSurah}`;
      _englishByKey.set(key, a.text);
      _rukoByKey.set(key, a.ruku);
      _juzByKey.set(key, a.juz);
      _pageByKey.set(key, a.page);
      if (!juzFirstSeen.has(a.juz)) {
        juzFirstSeen.set(a.juz, { surahNumber: s.number, ayahNumber: a.numberInSurah });
      }
    }
  }

  for (const s of raw.urdu.data.surahs) {
    for (const a of s.ayahs) {
      _urduByKey.set(`${s.number}:${a.numberInSurah}`, a.text);
    }
  }

  _surahs = raw.english.data.surahs.map((s: RawSurah) => ({
    number: s.number,
    nameArabic: s.name,
    nameEnglish: s.englishName,
    nameTranslation: s.englishNameTranslation,
    revelationType: s.revelationType as "Meccan" | "Medinan",
    ayahCount: s.ayahs.length,
  }));

  _juzList = Array.from({ length: 30 }, (_, i) => {
    const n = i + 1;
    const start = juzFirstSeen.get(n) ?? { surahNumber: 1, ayahNumber: 1 };
    const startSurah = _surahs!.find((s) => s.number === start.surahNumber);
    return {
      number: n,
      arabicName: JUZ_ARABIC_NAMES[n] ?? `جزء ${n}`,
      startSurahNumber: start.surahNumber,
      startAyahNumber: start.ayahNumber,
      startSurahName: startSurah?.nameEnglish ?? "",
    };
  });
}

export function initAsync(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = loadQuranRawData().then((raw) => {
    _raw = raw;
    buildMaps(raw);
  });
  return _initPromise;
}

export function isReady(): boolean {
  return _arabicMap !== null;
}

export function getSurahs(): SurahMeta[] {
  return _surahs ?? [];
}

export function getSurah(surahNumber: number): SurahMeta | undefined {
  return _surahs?.find((s) => s.number === surahNumber);
}

export function getJuzList(): JuzMeta[] {
  return _juzList ?? [];
}

export function getSurahAyahs(surahNumber: number): AyahData[] {
  if (!_raw || !_arabicMap) return [];
  const surah = _raw.english.data.surahs.find((s) => s.number === surahNumber);
  if (!surah) return [];

  return surah.ayahs.map((a) => {
    const key = `${surahNumber}:${a.numberInSurah}`;
    return {
      surahNumber,
      ayahNumber: a.numberInSurah,
      arabic: _arabicMap!.get(key) ?? "",
      english: _englishByKey!.get(key) ?? "",
      urdu: _urduByKey!.get(key) ?? "",
      juz: _juzByKey!.get(key) ?? 1,
      ruku: _rukoByKey!.get(key) ?? 1,
      page: _pageByKey!.get(key) ?? 1,
    };
  });
}

export function searchAyahs(
  query: string,
  extraLangMap?: Map<string, string>
): AyahData[] {
  if (!query.trim() || !_raw || !_arabicMap) return [];

  const q = query.toLowerCase().trim();
  const results: AyahData[] = [];

  for (const s of _raw.english.data.surahs) {
    for (const a of s.ayahs) {
      const key = `${s.number}:${a.numberInSurah}`;
      const eng = _englishByKey!.get(key) ?? "";
      const urd = _urduByKey!.get(key) ?? "";
      const arb = _arabicMap!.get(key) ?? "";
      const extra = extraLangMap?.get(key) ?? "";

      if (
        eng.toLowerCase().includes(q) ||
        urd.includes(q) ||
        arb.includes(q) ||
        extra.toLowerCase().includes(q)
      ) {
        results.push({
          surahNumber: s.number,
          ayahNumber: a.numberInSurah,
          arabic: arb,
          english: eng,
          urdu: urd,
          juz: _juzByKey!.get(key) ?? 1,
          ruku: _rukoByKey!.get(key) ?? 1,
          page: _pageByKey!.get(key) ?? 1,
        });
        if (results.length >= 100) return results;
      }
    }
  }

  return results;
}
