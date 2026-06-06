import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { SurahMeta } from "@/types/quran";

interface Props {
  surah: SurahMeta;
}

export function SurahCard({ surah }: Props) {
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
      onPress={() => router.push(`/surah/${surah.number}`)}
    >
      <View
        style={[styles.numberBadge, { backgroundColor: colors.accent }]}
      >
        <Text style={[styles.numberText, { color: colors.gold }]}>
          {surah.number}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.englishName, { color: colors.text }]}>
              {surah.nameEnglish}
            </Text>
            <Text
              style={[styles.translation, { color: colors.mutedForeground }]}
            >
              {surah.nameTranslation}
            </Text>
          </View>
          <View style={styles.rightSide}>
            <Text style={[styles.arabicName, { color: colors.arabicText }]}>
              {surah.nameArabic.replace(/^سُورَةُ\s+/, "")}
            </Text>
            <Text
              style={[styles.ayahCount, { color: colors.mutedForeground }]}
            >
              {surah.ayahCount} ayahs ·{" "}
              <Text
                style={{
                  color:
                    surah.revelationType === "Meccan"
                      ? "#5BA87A"
                      : "#7A8EC9",
                }}
              >
                {surah.revelationType}
              </Text>
            </Text>
          </View>
        </View>
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
    gap: 12,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  englishName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  translation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  rightSide: {
    alignItems: "flex-end",
  },
  arabicName: {
    fontSize: 18,
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
  },
  ayahCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
