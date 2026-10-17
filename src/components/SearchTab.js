
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
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
  searchDisplayCount,
  setSearchDisplayCount,
  searchPages,
  searchHasNext,
  searchLoadingMore,
  fetchMoreSearch,
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
              const hasMoreLocal = media.length > displayCount;
              const hasMoreApi = searchHasNext?.[extId] || false;
              const isLoadingMore = searchLoadingMore?.[extId] || false;
              const currentPage = searchPages?.[extId] || 1;
              const remainingLocal = media.length - displayCount;
              
              // Show More if either local remaining OR api hasNext
              const showMore = hasMoreLocal || hasMoreApi;
              
              const handleMore = () => {
                if (hasMoreLocal) {
                  // Show more from already loaded
                  setSearchDisplayCount((prev) => ({
                    ...prev,
                    [extId]: (prev[extId] || 9) + 9,
                  }));
                } else if (hasMoreApi) {
                  // Fetch next page from API
                  fetchMoreSearch(extId);
                }
              };

              return (
                <View key={extId} style={{ marginTop: 5, marginBottom: 16 }}>
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
                      {extensions[extId]?.name} • {media.length} (p{currentPage})
                    </Text>
                    {showMore && (
                      <TouchableOpacity
                        onPress={handleMore}
                        disabled={isLoadingMore}
                        style={[
                          styles.smallBtn,
                          {
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          },
                        ]}
                      >
                        {isLoadingMore ? (
                          <ActivityIndicator size="small" color={colors.text} />
                        ) : (
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {hasMoreLocal ? `More (${remainingLocal})` : `Next Page`}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ marginTop: 12 }}>{renderGrid(displayed)}</View>
                  {showMore && (
                    <TouchableOpacity
                      onPress={handleMore}
                      disabled={isLoadingMore}
                      style={[
                        styles.secondaryBtn,
                        {
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                          marginTop: 12,
                          height: 44,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 8,
                        },
                      ]}
                    >
                      {isLoadingMore ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <>
                          <Ionicons name={hasMoreLocal ? "chevron-down" : "cloud-download-outline"} size={16} color={colors.text} />
                          <Text
                            style={[
                              styles.secondaryBtnText,
                              { color: colors.text },
                            ]}
                          >
                            {hasMoreLocal
                              ? `Load more (${remainingLocal} remaining)`
                              : `Load page ${currentPage + 1} from ${extensions[extId]?.name}`}
                          </Text>
                        </>
                      )}
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
