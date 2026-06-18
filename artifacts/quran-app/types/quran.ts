export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  ayahCount: number;
}

export interface AyahData {
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  english: string;
  urdu: string;
  juz: number;
  ruku: number;
  page: number;
}

export interface JuzMeta {
  number: number;
  arabicName: string;
  startSurahNumber: number;
  startAyahNumber: number;
  startSurahName: string;
  endSurahNumber: number;
  endAyahNumber: number;
  endSurahName: string;
  ayahCount: number;
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  savedAt: number;
}

export interface QuranSettings {
  arabicFontSize: number;
  translationFontSize: number;
  showEnglish: boolean;
  showUrdu: boolean;
  activeExtraLang: string | null;
}

export interface ExtraLanguage {
  id: string;
  edition: string;
  nameEnglish: string;
  nameNative: string;
  direction: "ltr" | "rtl";
}

export type DownloadStatus = "not_downloaded" | "downloading" | "downloaded" | "error";
