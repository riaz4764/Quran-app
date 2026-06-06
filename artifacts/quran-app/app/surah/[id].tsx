import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AyahCard } from "@/components/AyahCard";
import { useColors } from "@/hooks/useColors";
import { getSurah, getSurahAyahs } from "@/utils/quranData";
import type { AyahData } from "@/types/quran";

const BISMILLAH = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";

export default function SurahReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const surahNumber = Number(id);
  const surah = getSurah(surahNumber);
  const ayahs = useMemo(() => getSurahAyahs(surahNumber), [surahNumber]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  if (!surah) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Surah not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.surahNameArabic, { color: colors.arabicText }]}>
            {surah.nameArabic.replace(/^سُورَةُ\s+/, "")}
          </Text>
          <Text style={[styles.surahNameEnglish, { color: colors.mutedForeground }]}>
            {surah.nameEnglish} · {surah.ayahCount} Ayahs
          </Text>
        </View>

        <View style={styles.numberBadge}>
          <Text style={[styles.numberText, { color: colors.gold }]}>
            {surah.number}
          </Text>
        </View>
      </View>

      <FlatList
        data={ayahs}
        keyExtractor={(a) => String(a.ayahNumber)}
        renderItem={({ item }: { item: AyahData }) => <AyahCard ayah={item} />}
        ListHeaderComponent={
          showBismillah ? (
            <View
              style={[
                styles.bismillahCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginHorizontal: 16,
                  marginTop: 12,
                },
              ]}
            >
              <Text style={[styles.bismillahText, { color: colors.arabicText }]}>
                {BISMILLAH}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingTop: showBismillah ? 0 : 8,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  surahNameArabic: {
    fontSize: 22,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
  },
  surahNameEnglish: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  numberBadge: {
    width: 36,
    alignItems: "center",
  },
  numberText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  bismillahCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 4,
    alignItems: "center",
  },
  bismillahText: {
    fontSize: 24,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
    lineHeight: 40,
  },
});
