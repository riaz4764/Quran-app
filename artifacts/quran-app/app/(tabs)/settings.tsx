import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuranSettings } from "@/context/QuranContext";
import { useColors } from "@/hooks/useColors";
import type { DownloadStatus, ExtraLanguage } from "@/types/quran";
import {
  EXTRA_LANGUAGES,
  deleteLanguage,
  downloadLanguage,
  getDownloadStatuses,
} from "@/utils/languageManager";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, setActiveExtraLang } = useQuranSettings();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [statuses, setStatuses] = useState<Record<string, DownloadStatus>>({});

  useEffect(() => {
    getDownloadStatuses().then(setStatuses);
  }, []);

  const handleDownload = async (lang: ExtraLanguage) => {
    setStatuses((s) => ({ ...s, [lang.edition]: "downloading" }));
    await downloadLanguage(lang.edition, (status) => {
      setStatuses((s) => ({ ...s, [lang.edition]: status }));
    });
  };

  const handleDelete = async (lang: ExtraLanguage) => {
    await deleteLanguage(lang.edition);
    setStatuses((s) => ({ ...s, [lang.edition]: "not_downloaded" }));
    if (settings.activeExtraLang === lang.edition) {
      setActiveExtraLang(null);
    }
  };

  const handleToggleActive = async (lang: ExtraLanguage) => {
    if (settings.activeExtraLang === lang.edition) {
      await setActiveExtraLang(null);
    } else {
      await setActiveExtraLang(lang.edition);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100),
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          BUNDLED TRANSLATIONS
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow label="English (Hilali-Khan)" colors={colors}>
            <Switch
              value={settings.showEnglish}
              onValueChange={(v) => updateSettings({ showEnglish: v })}
              trackColor={{ false: colors.muted, true: colors.gold }}
              thumbColor="#fff"
            />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow label="Urdu — اردو (Jalandhry)" colors={colors}>
            <Switch
              value={settings.showUrdu}
              onValueChange={(v) => updateSettings({ showUrdu: v })}
              trackColor={{ false: colors.muted, true: colors.gold }}
              thumbColor="#fff"
            />
          </SettingRow>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          ADDITIONAL LANGUAGES
        </Text>
        <Text
          style={[styles.sectionHint, { color: colors.mutedForeground }]}
        >
          Download once · works offline · one active at a time
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {EXTRA_LANGUAGES.map((lang, idx) => {
            const status = statuses[lang.edition] ?? "not_downloaded";
            const isActive = settings.activeExtraLang === lang.edition;
            const isDownloaded = status === "downloaded";
            const isDownloading = status === "downloading";

            return (
              <React.Fragment key={lang.id}>
                {idx > 0 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                )}
                <View style={styles.langRow}>
                  <View style={styles.langInfo}>
                    <Text style={[styles.langName, { color: colors.text }]}>
                      {lang.nameEnglish}
                    </Text>
                    <Text
                      style={[
                        styles.langNative,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {lang.nameNative}
                    </Text>
                  </View>

                  <View style={styles.langActions}>
                    {isDownloading ? (
                      <ActivityIndicator size="small" color={colors.gold} />
                    ) : isDownloaded ? (
                      <>
                        <Switch
                          value={isActive}
                          onValueChange={() => handleToggleActive(lang)}
                          trackColor={{ false: colors.muted, true: "#7AAFCF" }}
                          thumbColor="#fff"
                        />
                        <Pressable
                          onPress={() => handleDelete(lang)}
                          hitSlop={6}
                          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                        >
                          <Feather
                            name="trash-2"
                            size={14}
                            color={colors.mutedForeground}
                          />
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => handleDownload(lang)}
                        style={({ pressed }) => [
                          styles.downloadBtn,
                          {
                            backgroundColor: pressed
                              ? colors.cardElevated
                              : colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Feather
                          name="download"
                          size={13}
                          color={colors.gold}
                        />
                        <Text
                          style={[styles.downloadLabel, { color: colors.gold }]}
                        >
                          {status === "error" ? "Retry" : "Download"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          FONT SIZE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <FontRow
            label="Arabic Font"
            value={settings.arabicFontSize}
            min={18}
            max={48}
            step={2}
            onDecrement={() =>
              updateSettings({
                arabicFontSize: Math.max(18, settings.arabicFontSize - 2),
              })
            }
            onIncrement={() =>
              updateSettings({
                arabicFontSize: Math.min(48, settings.arabicFontSize + 2),
              })
            }
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <FontRow
            label="Translation Font"
            value={settings.translationFontSize}
            min={11}
            max={22}
            step={1}
            onDecrement={() =>
              updateSettings({
                translationFontSize: Math.max(
                  11,
                  settings.translationFontSize - 1
                ),
              })
            }
            onIncrement={() =>
              updateSettings({
                translationFontSize: Math.min(
                  22,
                  settings.translationFontSize + 1
                ),
              })
            }
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.gold }]}>
          PREVIEW
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.previewArabic,
              {
                color: colors.arabicText,
                fontSize: settings.arabicFontSize,
                lineHeight: settings.arabicFontSize * 1.85,
              },
            ]}
          >
            {`قُلْ هُوَ اللَّهُ أَحَدٌ \u06DD\u0661`}
          </Text>
          {settings.showEnglish && (
            <Text
              style={[
                styles.previewTranslation,
                {
                  color: colors.englishText,
                  fontSize: settings.translationFontSize,
                },
              ]}
            >
              Say: He is Allah, the One
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Arabic: Uthmani Hafs · English: Hilali-Khan
        </Text>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Urdu: Jalandhry · Source: alquran.cloud
        </Text>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          100% Offline · No Ads · No Tracking
        </Text>
      </View>
    </ScrollView>
  );
}

function SettingRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

function FontRow({
  label,
  value,
  onDecrement,
  onIncrement,
  colors,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onDecrement: () => void;
  onIncrement: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fontRow}>
      <Text style={[styles.fontLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.counter}>
        <Pressable
          onPress={onDecrement}
          style={[styles.counterBtn, { backgroundColor: colors.surface }]}
          hitSlop={4}
        >
          <Feather name="minus" size={16} color={colors.gold} />
        </Pressable>
        <Text style={[styles.counterVal, { color: colors.text }]}>{value}</Text>
        <Pressable
          onPress={onIncrement}
          style={[styles.counterBtn, { backgroundColor: colors.surface }]}
          hitSlop={4}
        >
          <Feather name="plus" size={16} color={colors.gold} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  langInfo: {
    flex: 1,
    gap: 3,
  },
  langName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  langNative: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  langActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  downloadLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fontLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    width: 32,
    textAlign: "center",
  },
  previewArabic: {
    fontFamily: "Amiri_400Regular",
    textAlign: "right",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  previewTranslation: {
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
