import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { styles } from "../styles/styles.js";
import { Ionicons } from "@expo/vector-icons";

export function HomeTab({
  colors,
  theme,
  homePills,
  activeHomeType,
  extensions,
  setTab,
  setActiveHomeType,
  setTheme,
  loading,
  homeData,
  ActivityIndicator,
  library,
  setHomeData,
  handleSelect,
  isInLibrary,
}) {
  const renderHorizontalList = (data) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12 }}
      contentContainerStyle={{ paddingRight: 20, gap: 12 }}
    >
      {data.map((item) => (
        <TouchableOpacity
          key={`${item._sourceId}-${item._type}-${item.id}`}
          style={{ width: 132 }}
          onPress={() => handleSelect(item)}
        >
          <View
            style={[
              styles.poster,
              { backgroundColor: colors.card, height: 184 },
            ]}
          >
            <Image
              source={{
                uri: item.coverImage.extraLarge || item.coverImage.large,
              }}
              style={styles.posterImg}
            />
            {isInLibrary(item.id, item._sourceId) ? (
              <View style={styles.badge}>
                <Ionicons name="bookmark" size={10} color="#000" />
              </View>
            ) : null}
          </View>
          <Text
            style={[styles.cardTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title.english || item.title.romaji}
          </Text>
          <Text
            style={[styles.cardMeta, { color: colors.sub }]}
            numberOfLines={1}
          >
            {item._type}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const fetchMorePopular = async (extId, type) => {
    const key = `${extId}-${type}`;
    const current = homeData[key];
    if (!current || !current.hasNext) return;
    const nextPage = (current.page || 1) + 1;
    const ext = extensions[extId];
    const result = await ext.get.popular(type, nextPage);
    setHomeData((prev) => ({
      ...prev,
      [key]: {
        media: [
          ...(prev[key]?.media || []),
          ...(result.media || []).map((m) => ({
            ...m,
            _sourceId: extId,
            _type: type,
          })),
        ],
        hasNext: result.hasNext || false,
        page: nextPage,
        error: result.error || null,
      },
    }));
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[1]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.largeTitle, { color: colors.text }]}>Home</Text>
        </View>
        <TouchableOpacity
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons
            name={theme === "dark" ? "sunny" : "moon"}
            size={18}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.stickyPillContainer, { backgroundColor: colors.bg }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          {homePills.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveHomeType(t)}
              style={[
                styles.homePillFixed,
                {
                  backgroundColor:
                    activeHomeType === t ? colors.pillActiveBg : colors.card,
                  borderWidth: activeHomeType === t ? 0 : 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.homePillText,
                  {
                    color:
                      activeHomeType === t ? colors.pillActiveText : colors.sub,
                  },
                ]}
              >
                {t === "ALL" ? "All" : t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {Object.keys(extensions).length === 0 ? (
        <View style={[styles.empty, { marginTop: 100 }, { paddingTop: 80 }]}>
          <Ionicons
            name="extension-puzzle-outline"
            size={56}
            color={colors.card2}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No sources yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.sub }]}>
            Add a source to discover anime and manga
          </Text>
          <TouchableOpacity
            onPress={() => setTab("extensions")}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.text,
                marginTop: 20,
                paddingHorizontal: 10,
                height: 30,
              },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.bg }]}>
              Add Source
            </Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={{ marginTop: 60 }}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        Object.entries(homeData)
          .filter(
            ([key]) =>
              activeHomeType === "ALL" || key.endsWith(`-${activeHomeType}`),
          )
          .map(([key, data]) => {
            const [extId, ...typeParts] = key.split("-");
            const type = typeParts.join("-");
            const ext = extensions[extId];
            return (
              <View key={key} style={{ marginTop: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {type}
                  </Text>
                  {data.hasNext && (
                    <TouchableOpacity
                      onPress={() => fetchMorePopular(extId, type)}
                      style={[
                        styles.smallBtn,
                        {
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        More
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {data.error ? (
                  <View
                    style={[styles.errorBox, { backgroundColor: colors.card }]}
                  >
                    <Text style={{ color: "#EF4444", fontSize: 12 }}>
                      {data.error}
                    </Text>
                  </View>
                ) : null}
                {data.media.length === 0 && !data.error ? (
                  <View
                    style={[
                      styles.emptySmall,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <Text style={{ color: colors.sub, fontSize: 13 }}>
                      No content
                    </Text>
                  </View>
                ) : (
                  renderHorizontalList(data.media)
                )}
              </View>
            );
          })
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}
