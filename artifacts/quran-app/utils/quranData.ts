import type { AyahData, SurahMeta } from "@/types/quran";

const arabicRaw = require("@/assets/data/arabic.json") as {
  quran: { chapter: number; verse: number; text: string }[];
};

const englishRaw = require("@/assets/data/english.json") as {
  data: {
    surahs: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: string;
      ayahs: { numberInSurah: number; text: string }[];
    }[];
  };
};

const urduRaw = require("@/assets/data/urdu.json") as {
  data: {
    surahs: {
      number: number;
      ayahs: { numberInSurah: number; text: string }[];
    }[];
  };
};

let _arabicMap: Map<string, string> | null = null;
let _surahs: SurahMeta[] | null = null;
let _englishByKey: Map<string, string> | null = null;
let _urduByKey: Map<string, string> | null = null;

function initMaps() {
  if (_arabicMap) return;

  _arabicMap = new Map();
  for (const v of arabicRaw.quran) {
    _arabicMap.set(`${v.chapter}:${v.verse}`, v.text);
  }

  _englishByKey = new Map();
  _urduByKey = new Map();

  for (const s of englishRaw.data.surahs) {
    for (const a of s.ayahs) {
      _englishByKey.set(`${s.number}:${a.numberInSurah}`, a.text);
    }
  }

  for (const s of urduRaw.data.surahs) {
    for (const a of s.ayahs) {
      _urduByKey.set(`${s.number}:${a.numberInSurah}`, a.text);
    }
  }

  _surahs = englishRaw.data.surahs.map((s) => ({
    number: s.number,
    nameArabic: s.name,
    nameEnglish: s.englishName,
    nameTranslation: s.englishNameTranslation,
    revelationType: s.revelationType as "Meccan" | "Medinan",
    ayahCount: s.ayahs.length,
  }));
}

export function getSurahs(): SurahMeta[] {
  initMaps();
  return _surahs!;
}

export function getSurah(surahNumber: number): SurahMeta | undefined {
  initMaps();
  return _surahs!.find((s) => s.number === surahNumber);
}

export function getSurahAyahs(surahNumber: number): AyahData[] {
  initMaps();
  const surah = englishRaw.data.surahs.find((s) => s.number === surahNumber);
  if (!surah) return [];

  return surah.ayahs.map((a) => {
    const key = `${surahNumber}:${a.numberInSurah}`;
    return {
      surahNumber,
      ayahNumber: a.numberInSurah,
      arabic: _arabicMap!.get(key) ?? "",
      english: _englishByKey!.get(key) ?? "",
      urdu: _urduByKey!.get(key) ?? "",
    };
  });
}

export function searchAyahs(query: string): AyahData[] {
  if (!query.trim()) return [];
  initMaps();

  const q = query.toLowerCase().trim();
  const results: AyahData[] = [];

  for (const s of englishRaw.data.surahs) {
    for (const a of s.ayahs) {
      const key = `${s.number}:${a.numberInSurah}`;
      const eng = _englishByKey!.get(key) ?? "";
      const urd = _urduByKey!.get(key) ?? "";
      const arb = _arabicMap!.get(key) ?? "";

      if (
        eng.toLowerCase().includes(q) ||
        urd.includes(q) ||
        arb.includes(q)
      ) {
        results.push({
          surahNumber: s.number,
          ayahNumber: a.numberInSurah,
          arabic: arb,
          english: eng,
          urdu: urd,
        });
        if (results.length >= 100) return results;
      }
    }
  }

  return results;
}
