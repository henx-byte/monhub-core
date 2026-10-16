import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";
import { useState } from "react";

const MIHON_INSTALLED_MOCK = [
  {
    id: "kiryuu",
    packageName: "eu.kanade.tachiyomi.extension.id.kiryuu",
    name: "Kiryuu",
    lang: "id",
    tags: ["MANGA", "ID"],
  },
  {
    id: "lumoskomik",
    packageName: "eu.kanade.tachiyomi.extension.id.lumoskomik",
    name: "LumosKomik",
    lang: "id",
    tags: ["MANGA", "ID"],
  },
  {
    id: "komikdewasa",
    packageName: "eu.kanade.tachiyomi.extension.id.komikdewasa",
    name: "KomikDewasa",
    lang: "id",
    tags: ["MANGA", "ID", "NSFW"],
  },
  {
    id: "doujinku",
    packageName: "eu.kanade.tachiyomi.extension.id.doujinku",
    name: "Doujinku",
    lang: "id",
    tags: ["MANGA", "ID", "NSFW"],
  },
  {
    id: "doujindesu",
    packageName: "eu.kanade.tachiyomi.extension.id.doujindesu",
    name: "Doujindesu",
    lang: "id",
    tags: ["MANGA", "ID", "NSFW"],
  },
  {
    id: "cosmicscansid",
    packageName: "eu.kanade.tachiyomi.extension.id.cosmicscansid",
    name: "CosmicScansID",
    lang: "id",
    tags: ["MANGA", "ID"],
  },
  {
    id: "shinigami",
    packageName: "eu.kanade.tachiyomi.extension.id.shinigami",
    name: "Shinigami",
    lang: "id",
    tags: ["MANGA", "ID"],
  },
  {
    id: "samehadaku",
    packageName: "eu.kanade.tachiyomi.animeextension.id.samehadaku",
    name: "Samehadaku",
    lang: "id",
    tags: ["ANIME", "ID"],
  },
  {
    id: "mangasusu",
    packageName: "eu.kanade.tachiyomi.extension.id.mangasusu",
    name: "MangaSusu",
    lang: "id",
    tags: ["MANGA", "ID", "NSFW"],
  },
  {
    id: "mangatale",
    packageName: "eu.kanade.tachiyomi.extension.id.mangatale",
    name: "MangaTale",
    lang: "id",
    tags: ["MANGA", "ID"],
  },
];

export function ExtensionsTab({
  extensions,
  extUrl,
  setExtUrl,
  addingUrl,
  handleAddUrl,
  handlePickFile,
  setExtensions,
  colors,
}) {
  const [activeTag, setActiveTag] = useState("ALL");
  const [showMihon, setShowMihon] = useState(true);

  const filteredExtensions = Object.values(extensions).filter((ext) => {
    if (activeTag === "ALL") return true;
    const tags = getExtTags(ext);
    return tags.includes(activeTag);
  });

  const filteredMihon = MIHON_INSTALLED_MOCK.filter((ext) => {
    if (activeTag === "ALL") return true;
    return ext.tags.includes(activeTag);
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.largeTitle, { color: colors.text }]}>
            Sources
          </Text>
          <Text style={[styles.subCount, { color: colors.sub }]}>
            {Object.keys(extensions).length} added
          </Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
        Add from URL
      </Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            marginTop: 8,
          },
        ]}
      >
        <Feather
          name="link"
          size={16}
          color={colors.sub}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={extUrl}
          onChangeText={setExtUrl}
          placeholder="https://example.com/extension.json"
          placeholderTextColor={colors.sub}
          style={[styles.urlInput, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={handleAddUrl}
          disabled={addingUrl || !extUrl.trim()}
          style={[
            styles.addUrlBtn,
            { backgroundColor: extUrl.trim() ? colors.text : colors.card2 },
          ]}
        >
          {addingUrl ? (
            <ActivityIndicator size="small" color={colors.bg} />
          ) : (
            <Text
              style={{
                color: extUrl.trim() ? colors.bg : colors.sub,
                fontWeight: "600",
                fontSize: 10,
              }}
            >
              Add
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
        Add from File
      </Text>
      <TouchableOpacity
        onPress={handlePickFile}
        style={[
          styles.fileCard,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
            marginTop: 8,
          },
        ]}
      >
        <View style={[styles.fileIcon, { backgroundColor: colors.bg }]}>
          <Ionicons name="document-outline" size={22} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fileTitle, { color: colors.text }]}>
            Select JSON file
          </Text>
          <Text style={[styles.fileSub, { color: colors.sub }]}>
            Only .json files are accepted
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.sub} />
      </TouchableOpacity>

      {/* MIHON DETECTED SECTION - NEW! */}
      <View
        style={{
          marginTop: 28,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={[styles.label, { color: colors.text }]}>
          Mihon Extensions Detected ({filteredMihon.length})
        </Text>
        <TouchableOpacity
          onPress={() => setShowMihon(!showMihon)}
          style={[
            styles.smallBtn,
            {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={{ color: colors.text, fontSize: 12 }}>
            {showMihon ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {showMihon && (
        <View style={{ marginTop: 12, gap: 10 }}>
          {filteredMihon.map((ext) => (
            <View
              key={ext.packageName}
              style={[
                styles.sourceCard,
                {
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderLeftWidth: 3,
                  borderLeftColor: "#10B981",
                },
              ]}
            >
              <View style={[styles.sourceIcon, { backgroundColor: "#10B981" }]}>
                <Ionicons name="phone-portrait" size={14} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sourceName, { color: colors.text }]}>
                  {ext.name}{" "}
                  <Text style={{ fontSize: 10, color: colors.sub }}>• APK</Text>
                </Text>
                <Text style={[styles.sourceMeta, { color: colors.sub }]}>
                  {ext.packageName}
                </Text>
                <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                  {ext.tags.map((t) => (
                    <View
                      key={t}
                      style={{
                        backgroundColor:
                          t === "NSFW"
                            ? "#EF4444"
                            : t === "ANIME"
                              ? "#8B5CF6"
                              : colors.card2,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            t === "NSFW" || t === "ANIME"
                              ? "#FFF"
                              : colors.text,
                          fontSize: 9,
                          fontWeight: "700",
                        }}
                      >
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // Convert Mihon APK to Moonhub JSON logic (mock for now)
                  alert(
                    `Convert ${ext.name} to Moonhub format?\nPackage: ${ext.packageName}\n\nNanti bakal auto generate popularCode dari GitHub source!`,
                  );
                }}
                style={[
                  styles.deleteBtn,
                  { backgroundColor: colors.text, borderWidth: 0 },
                ]}
              >
                <Ionicons name="download-outline" size={14} color={colors.bg} />
              </TouchableOpacity>
            </View>
          ))}
          <View
            style={[
              styles.emptySmall,
              { backgroundColor: colors.card2, marginTop: 4 },
            ]}
          >
            <Text
              style={{ color: colors.sub, fontSize: 11, textAlign: "center" }}
            >
              Detected via: adb shell pm list packages --user all | grep
              tachiyomi
            </Text>
          </View>
        </View>
      )}

      <Text style={[styles.label, { color: colors.text, marginTop: 28 }]}>
        Installed Sources
      </Text>
      {Object.values(extensions).length === 0 ? (
        <View
          style={[
            styles.emptySmall,
            {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              marginTop: 12,
            },
          ]}
        >
          <Text
            style={{ color: colors.sub, fontSize: 13, textAlign: "center" }}
          >
            No sources added yet. Add from URL or file above.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          {Object.values(extensions).map((ext) => {
            const features = [];
            if (ext._popularCode) features.push("popular: yes");
            if (ext._searchCode) features.push("search: yes");
            if (ext._detailCode) features.push("detail: yes");
            if (ext._streamCode) features.push("stream: yes");
            return (
              <View
                key={ext.id}
                style={[
                  styles.sourceCard,
                  {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.sourceIcon,
                    {
                      backgroundColor: ext.enabled ? "#10B981" : colors.card2,
                    },
                  ]}
                >
                  <Ionicons
                    name={ext.enabled ? "checkmark" : "close"}
                    size={14}
                    color="#FFF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sourceName, { color: colors.text }]}>
                    {ext.name}
                  </Text>
                  <Text style={[styles.sourceMeta, { color: colors.sub }]}>
                    {ext.supportedTypes.join(", ")}
                  </Text>
                  <Text style={[styles.sourceFeatures, { color: colors.sub2 }]}>
                    {features.join(" • ")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const n = { ...extensions };
                    delete n[ext.id];
                    setExtensions(n);
                  }}
                  style={[
                    styles.deleteBtn,
                    {
                      backgroundColor: colors.bg,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ height: 140 }} />
    </ScrollView>
  );
}
