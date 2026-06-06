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
}
