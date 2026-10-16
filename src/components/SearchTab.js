import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";

export function SearchTab({
  colors,
  renderGrid,
  q,
  setQ,
  getAllTypes,
  searchType,
  searching,
  searchResults,
  ActivityIndicator,
  searchDisplayCount,
  extensions,
  setSearchType,
}) {
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.largeTitle, { color: colors.text }]}>
            Search
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <Feather
          name="search"
          size={18}
          color={colors.sub}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search anime, manga..."
          placeholderTextColor={colors.sub}
          style={[styles.searchInput, { color: colors.text }]}
          autoFocus
        />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => setQ("")}>
            <Ionicons name="close-circle" size={18} color={colors.sub} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, flexGrow: 0 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {["ALL", ...getAllTypes()].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setSearchType(t)}
            style={[
              styles.homePillFixed,
              {
                backgroundColor:
                  searchType === t ? colors.pillActiveBg : colors.card,
                borderWidth: searchType === t ? 0 : 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.homePillText,
                {
                  color: searchType === t ? colors.pillActiveText : colors.sub,
                },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {searching ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.text} />
      ) : q.length < 2 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={40} color={colors.card2} />
          <Text
            style={[styles.emptyText, { color: colors.sub, marginTop: 12 }]}
          >
            Type to search
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 16, flex: 1 }}
        >
          {Object.entries(searchResults).length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.sub }]}>
                No results for "{q}"
              </Text>
            </View>
          ) : (
            Object.entries(searchResults).map(([extId, media]) => {
              const displayCount = searchDisplayCount[extId] || 9;
              const displayed = media.slice(0, displayCount);
              const hasMore = media.length > displayCount;
              return (
                <View key={extId} style={{ marginTop: 5 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: colors.text, fontSize: 16 },
                      ]}
                    >
                      {extensions[extId]?.name} • {media.length}
                    </Text>
                    {hasMore && (
                      <TouchableOpacity
                        onPress={() =>
                          setSearchDisplayCount((prev) => ({
                            ...prev,
                            [extId]: (prev[extId] || 9) + 9,
                          }))
                        }
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
                  <View style={{ marginTop: 12 }}>{renderGrid(displayed)}</View>
                  {hasMore && (
                    <TouchableOpacity
                      onPress={() =>
                        setSearchDisplayCount((prev) => ({
                          ...prev,
                          [extId]: (prev[extId] || 9) + 9,
                        }))
                      }
                      style={[
                        styles.secondaryBtn,
                        {
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                          marginTop: 12,
                          height: 44,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.secondaryBtnText,
                          { color: colors.text },
                        ]}
                      >
                        Load more ({media.length - displayCount} remaining)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 140 }} />
        </ScrollView>
      )}
    </View>
  );
}
