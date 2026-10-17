import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StatusBar, Image, ActivityIndicator, Linking, Alert, ScrollView } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { getThemes } from "./src/theme/colors";
import { stripHtml } from "./src/helpers/xpath";
import { Ionicons } from "@expo/vector-icons";
import { createExtensionFromConfig } from "./src/core/extension";
import { styles } from "./src/styles/styles";
import { HomeTab } from "./src/components/HomeTab";
import { SearchTab } from "./src/components/SearchTab";
import { ExtensionsTab } from "./src/components/ExtensionsTab";
import { TabBar } from "./src/components/TabBar";
import { LibraryTab } from "./src/components/LibraryTab";
import { PlayerStream } from "./src/components/PlayerStream";
import { DetailView } from "./src/components/DetailView";

let WebView = null;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {}
let DocumentPicker = null;
try {
  DocumentPicker = require("expo-document-picker");
} catch (e) {}
let FileSystem = null;
try {
  FileSystem = require("expo-file-system/legacy");
} catch (e) {
  try {
    FileSystem = require("expo-file-system");
  } catch (e2) {}
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [isManga, setIsManga] = useState(false);
  const [tab, setTab] = useState("extensions");
  const [activeHomeType, setActiveHomeType] = useState("ALL");
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [searchType, setSearchType] = useState("ALL");
  const [searchResults, setSearchResults] = useState({});
  const [searchDisplayCount, setSearchDisplayCount] = useState({});
  const [searching, setSearching] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libraryFilter, setLibraryFilter] = useState("ALL");
  const [playingStream, setPlayingStream] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [extensions, setExtensions] = useState({});
  const [extUrl, setExtUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  const colors = getThemes(theme);

  let AsyncStorage = null;
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch (e) {}

  useEffect(() => {
    console.log("[CORE v27 Search 9 + Player Top Fix]");
    if (AsyncStorage) {
      AsyncStorage.getItem("moonhub_library")
        .then((v) => {
          if (v) setLibrary(JSON.parse(v));
        })
        .catch(() => {});
      AsyncStorage.getItem("moonhub_theme")
        .then((v) => {
          if (v) setTheme(v);
        })
        .catch(() => {});
      AsyncStorage.getItem("moonhub_extensions_v26").then((v) => {
        if (v) {
          try {
            const parsed = JSON.parse(v);
            const hydrated = {};
            Object.entries(parsed).forEach(([id, ext]) => {
              hydrated[id] = createExtensionFromConfig(ext);
            });
            setExtensions(hydrated);
            if (Object.keys(hydrated).length > 0) setTab("home");
            setTimeout(() => fetchAllPopular(hydrated), 500);
          } catch (e) {
            console.log(`[LOAD ERR] ${e.message}`);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (AsyncStorage) AsyncStorage.setItem("moonhub_library", JSON.stringify(library)).catch(() => {});
  }, [library]);
  useEffect(() => {
    if (AsyncStorage) AsyncStorage.setItem("moonhub_theme", theme).catch(() => {});
  }, [theme]);
  useEffect(() => {
    if (AsyncStorage) {
      const toSave = {};
      Object.entries(extensions).forEach(([id, ext]) => {
        toSave[id] = {
          id: ext.id,
          name: ext.name,
          supportedTypes: ext.supportedTypes,
          enabled: ext.enabled,
          version: ext.version,
          source: ext._source,
          popularCode: ext._popularCode,
          searchCode: ext._searchCode,
          detailCode: ext._detailCode,
          streamCode: ext._streamCode,
        };
      });
      AsyncStorage.setItem("moonhub_extensions_v26", JSON.stringify(toSave));
    }
  }, [extensions]);

  const getAllTypes = () => {
    const types = new Set();
    Object.values(extensions).forEach((ext) => {
      if (ext.enabled && ext.supportedTypes) ext.supportedTypes.forEach((t) => types.add(t));
    });
    return Array.from(types);
  };

  const fetchAllPopular = async (exts = null) => {
    const useExts = exts || extensions;
    if (Object.keys(useExts).length === 0) {
      setHomeData({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const newData = {};
    for (const ext of Object.values(useExts).filter((e) => e.enabled)) {
      if (!ext.supportedTypes) continue;
      for (const type of ext.supportedTypes) {
        const key = `${ext.id}-${type}`;
        const result = await ext.get.popular(type, 1);
        newData[key] = {
          media: (result.media || []).map((m) => ({
            ...m,
            _sourceId: ext.id,
            _type: type,
          })),
          hasNext: result.hasNext || false,
          page: 1,
          error: result.error || null,
        };
      }
    }
    setHomeData(newData);
    setLoading(false);
  };

  // Search pagination states
  const [searchPages, setSearchPages] = useState({}); // {extId: page}
  const [searchHasNext, setSearchHasNext] = useState({}); // {extId: bool}
  const [searchLoadingMore, setSearchLoadingMore] = useState({});

  const fetchMoreSearch = async (extId) => {
    const current = searchResults[extId];
    if (!current || !searchHasNext[extId] || searchLoadingMore[extId]) return;
    const nextPage = (searchPages[extId] || 1) + 1;
    const ext = extensions[extId];
    if (!ext) return;
    setSearchLoadingMore((prev) => ({ ...prev, [extId]: true }));
    try {
      const allTypes = searchType === "ALL" ? getAllTypes(extensions) : [searchType];
      let newMedia = [];
      let hasNextAny = false;
      for (const type of allTypes) {
        if (!ext.supportedTypes.includes(type)) continue;
        const res = await ext.get.search(type, q, nextPage);
        newMedia = [...newMedia, ...(res.media || []).map((m) => ({ ...m, _sourceId: extId, _type: type }))];
        if (res.hasNext) hasNextAny = true;
      }
      console.log(`[SEARCH MORE] ${extId} page ${nextPage}: ${newMedia.length} items, hasNext=${hasNextAny}`);
      setSearchResults((prev) => ({
        ...prev,
        [extId]: [...(prev[extId] || []), ...newMedia],
      }));
      setSearchPages((prev) => ({ ...prev, [extId]: nextPage }));
      setSearchHasNext((prev) => ({ ...prev, [extId]: hasNextAny || newMedia.length >= 9 }));
    } catch (e) {
      console.log(`[SEARCH MORE ERR] ${extId}: ${e.message}`);
    } finally {
      setSearchLoadingMore((prev) => ({ ...prev, [extId]: false }));
    }
  };
  useEffect(() => {
    if (q.trim().length < 2) {
      setSearchResults({});
      setSearchPages({});
      setSearchHasNext({});
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const allTypes = searchType === "ALL" ? getAllTypes(extensions) : [searchType];
      const results = {};
      const pages = {};
      const hasNextMap = {};
      for (const ext of Object.values(extensions).filter((e) => e.enabled)) {
        let extResults = [];
        let hasNextAny = false;
        for (const type of allTypes) {
          if (!ext.supportedTypes.includes(type)) continue;
          const res = await ext.get.search(type, q, 1);
          extResults = [...extResults, ...(res.media || []).map((m) => ({ ...m, _sourceId: ext.id, _type: type }))];
          if (res.hasNext) hasNextAny = true;
        }
        if (extResults.length > 0) {
          results[ext.id] = extResults;
          pages[ext.id] = 1;
          hasNextMap[ext.id] = hasNextAny || extResults.length >= 9;
        }
      }
      setSearchResults(results);
      setSearchPages(pages);
      setSearchHasNext(hasNextMap);
      const newCounts = {};
      Object.keys(results).forEach((k) => (newCounts[k] = 9));
      setSearchDisplayCount(newCounts);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [q, searchType, extensions]);

  const handleSelect = async (item) => {
    setIsManga(item._type !== "ANIME");
    setSelected(item);
    setDetailData(null);
    const ext = extensions[item._sourceId];
    if (ext && ext._detailCode) {
      const detail = await ext.get.detail(item.id, item._type);
      if (detail) setDetailData(detail);
    }
  };

  const handleStream = async (item) => {
    const ext = extensions[item._sourceId];
    console.log(ext);
    if (!ext || !ext._streamCode) {
      if (item.trailer?.id) setPlayingStream({ type: "youtube", id: item.trailer.id });
      else Linking.openURL("https://www.youtube.com/results?search_query=" + encodeURIComponent((item.title.english || item.title.romaji) + " trailer"));
      return;
    }
    const stream = await ext.get.stream(item.id, item._type);
    if (!stream) return;
    if (stream.error) {
      Alert.alert("Error", stream.error);
      return;
    }
    setPlayingStream(stream);
  };

  const toggleLibrary = (item) => {
    const exists = library.find((x) => x.id === item.id && x._sourceId === item._sourceId);
    if (exists) setLibrary(library.filter((x) => !(x.id === item.id && x._sourceId === item._sourceId)));
    else setLibrary([...library, item]);
  };
  const handleAddUrl = async () => {
    if (!extUrl.trim()) {
      Alert.alert("Enter URL");
      return;
    }
    setAddingUrl(true);
    try {
      console.log(`[ADD URL] ${extUrl}`);
      const res = await fetch(extUrl.trim());
      const text = await res.text();
      let config;
      try {
        config = JSON.parse(text);
      } catch {
        throw new Error("URL does not return valid JSON");
      }
      config.source = { type: "url", url: extUrl.trim() };
      const ext = createExtensionFromConfig(config);
      if (!ext.id || !ext._popularCode) throw new Error("Invalid extension: missing id or popularCode");
      const newExts = { ...extensions, [ext.id]: ext };
      setExtensions(newExts);
      setExtUrl("");
      setTimeout(() => fetchAllPopular(newExts), 300);
      setTab("home");
    } catch (e) {
      console.log(`[URL FAIL] ${e.message}`);
      Alert.alert("Failed to add", e.message);
    } finally {
      setAddingUrl(false);
    }
  };

  const handlePickFile = async () => {
    if (!DocumentPicker) {
      Alert.alert("File picker not available");
      return;
    }
    try {
      // ONLY JSON
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith(".json")) {
        Alert.alert("Invalid file", "Please select a JSON file");
        return;
      }
      let content = "";
      try {
        const r = await fetch(file.uri);
        content = await r.text();
      } catch {
        if (FileSystem) {
          try {
            content = await FileSystem.readAsStringAsync(file.uri);
          } catch {}
        }
      }
      if (!content) {
        Alert.alert("Read Failed", "File is empty");
        return;
      }
      let config;
      try {
        config = JSON.parse(content);
      } catch {
        Alert.alert("Invalid JSON", "File is not valid JSON");
        return;
      }
      const ext = createExtensionFromConfig(config);
      if (!ext.id || !ext._popularCode) {
        Alert.alert("Invalid Extension", "Missing required fields: id, name, supportedTypes, popularCode, searchCode");
        return;
      }
      const newExts = { ...extensions, [ext.id]: ext };
      setExtensions(newExts);
      setTimeout(() => fetchAllPopular(newExts), 300);
      setTab("home");
    } catch (e) {
      Alert.alert("Failed", e.message);
    }
  };

  const isInLibrary = (id, sourceId) => library.some((x) => x.id === id && x._sourceId === sourceId);

  const renderGrid = (data) => (
    <View style={[styles.grid, { gap: 12 }]}>
      {data.map((item) => (
        <TouchableOpacity key={`${item._sourceId}-${item._type}-${item.id}`} style={[styles.gridCard, { width: "31%" }]} onPress={() => handleSelect(item)}>
          <View style={[styles.poster, { backgroundColor: colors.card }]}>
            <Image
              source={{
                uri: item.coverImage.extraLarge || item.coverImage.large,
              }}
              style={styles.posterImg}
            />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title.english || item.title.romaji}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getTypes = getAllTypes();
  const homePills = ["ALL", ...getTypes];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ExpoStatusBar style={theme === "dark" ? "light" : "dark"} />
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      {tab === "home" && !selected && <HomeTab colors={colors} theme={theme} homePills={homePills} activeHomeType={activeHomeType} extensions={extensions} setTab={setTab} setActiveHomeType={setActiveHomeType} setTheme={setTheme} loading={loading} homeData={homeData} ActivityIndicator={ActivityIndicator} library={library} setHomeData={setHomeData} handleSelect={handleSelect} isInLibrary={isInLibrary} />}

      {tab === "search" && !selected && <SearchTab colors={colors} renderGrid={renderGrid} q={q} setQ={setQ} getAllTypes={getAllTypes} searchType={searchType} searching={searching} searchResults={searchResults} ActivityIndicator={ActivityIndicator} searchDisplayCount={searchDisplayCount} extensions={extensions} setSearchType={setSearchType} searchPages={searchPages} searchHasNext={searchHasNext} searchLoadingMore={searchLoadingMore} fetchMoreSearch={fetchMoreSearch} setSearchDisplayCount={setSearchDisplayCount} />}

      {tab === "library" && !selected && <LibraryTab library={library} libraryFilter={libraryFilter} setLibraryFilter={setLibraryFilter} colors={colors} getAllTypes={getAllTypes} renderGrid={renderGrid} />}

      {tab === "extensions" && <ExtensionsTab extensions={extensions} extUrl={extUrl} setExtUrl={setExtUrl} addingUrl={addingUrl} handleAddUrl={handleAddUrl} handlePickFile={handlePickFile} setExtensions={setExtensions} colors={colors} />}

      {selected && <DetailView selected={selected} detailData={detailData} colors={colors} setSelected={setSelected} handleStream={handleStream} isInLibrary={isInLibrary} />}

      {playingStream && <PlayerStream playingStream={playingStream} setPlayingStream={setPlayingStream} />}

      {/* FIXED TAB BAR - no text cut off */}
      <TabBar tab={tab} setTab={setTab} setSelected={setSelected} colors={colors} />
    </View>
  );
}
