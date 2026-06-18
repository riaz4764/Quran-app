import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JuzCard } from "@/components/JuzCard";
import { SurahCard } from "@/components/SurahCard";
import { useColors } from "@/hooks/useColors";
import { getJuzList, getSurahs } from "@/utils/quranData";

type ViewMode = "surah" | "juz";

export default function SurahListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ViewMode>("surah");

  const SURAHS = getSurahs();
  const JUZS = getJuzList();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filteredSurahs = useMemo(() => {
    if (!query.trim()) return SURAHS;
    const q = query.toLowerCase();
    return SURAHS.filter(
      (s) =>
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameTranslation.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        String(s.number).includes(q)
    );
  }, [query]);

  const filteredJuzs = useMemo(() => {
    if (!query.trim()) return JUZS;
    const q = query.toLowerCase();
    return JUZS.filter(
      (j) =>
        j.arabicName.includes(q) ||
        j.startSurahName.toLowerCase().includes(q) ||
        String(j.number).includes(q)
    );
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.bismillah, { color: colors.arabicText }]}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          القرآن الكريم
        </Text>

        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            style={[
              styles.toggleBtn,
              mode === "surah" && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setMode("surah");
              setQuery("");
            }}
          >
            <Text
              style={[
                styles.toggleLabel,
                { color: mode === "surah" ? colors.gold : colors.mutedForeground },
              ]}
            >
              Surah
            </Text>
            <Text
              style={[
                styles.toggleSub,
                { color: mode === "surah" ? colors.mutedForeground : colors.muted },
              ]}
            >
              114
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleBtn,
              mode === "juz" && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setMode("juz");
              setQuery("");
            }}
          >
            <Text
              style={[
                styles.toggleLabel,
                { color: mode === "juz" ? colors.gold : colors.mutedForeground },
              ]}
            >
              Juz / Para
            </Text>
            <Text
              style={[
                styles.toggleSub,
                { color: mode === "juz" ? colors.mutedForeground : colors.muted },
              ]}
            >
              30
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder={
            mode === "surah"
              ? "Search surah name or number..."
              : "Search juz name or surah..."
          }
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      {mode === "surah" ? (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(s) => String(s.number)}
          renderItem={({ item }) => <SurahCard surah={item} />}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100),
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No surahs found
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredJuzs}
          keyExtractor={(j) => String(j.number)}
          renderItem={({ item }) => <JuzCard juz={item} />}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100),
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No results found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  bismillah: {
    fontSize: 20,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: "Amiri_400Regular",
    textAlign: "center",
    marginBottom: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    width: "100%",
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 2,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  toggleSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  searchInput: {
    width: "100%",
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
