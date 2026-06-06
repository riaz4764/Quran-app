import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { JuzMeta } from "@/types/quran";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toArabicNum(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d)]);
}

interface Props {
  juz: JuzMeta;
}

export function JuzCard({ juz }: Props) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.cardElevated : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/surah/[id]",
          params: {
            id: String(juz.startSurahNumber),
            startAyah: String(juz.startAyahNumber),
          },
        })
      }
    >
      <View style={[styles.numberBox, { backgroundColor: colors.accent }]}>
        <Text style={[styles.juzLabel, { color: colors.mutedForeground }]}>
          Juz
        </Text>
        <Text style={[styles.numberArabic, { color: colors.gold }]}>
          {toArabicNum(juz.number)}
        </Text>
        <Text style={[styles.numberWestern, { color: colors.mutedForeground }]}>
          {juz.number}
        </Text>
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.arabicName, { color: colors.arabicText }]}
          numberOfLines={1}
        >
          {juz.arabicName}
        </Text>
        <Text
          style={[styles.surahInfo, { color: colors.englishText }]}
          numberOfLines={1}
        >
          {juz.startSurahName}
        </Text>
        <Text style={[styles.ayahRef, { color: colors.mutedForeground }]}>
          Surah {juz.startSurahNumber} · Ayah {juz.startAyahNumber}
        </Text>
      </View>

      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  numberBox: {
    width: 52,
    height: 64,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  juzLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  numberArabic: {
    fontSize: 20,
    fontFamily: "Amiri_400Regular",
  },
  numberWestern: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  arabicName: {
    fontSize: 17,
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
  },
  surahInfo: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  ayahRef: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
