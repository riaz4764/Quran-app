export interface RawAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface RawSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: RawAyah[];
}

export interface QuranRawData {
  arabic: {
    quran: { chapter: number; verse: number; text: string }[];
  };
  english: {
    data: { surahs: RawSurah[] };
  };
  urdu: {
    data: {
      surahs: { number: number; ayahs: { numberInSurah: number; text: string }[] }[];
    };
  };
}
