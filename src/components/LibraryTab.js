import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { styles } from "../styles/styles.js";
import { Ionicons } from "@expo/vector-icons";

export function LibraryTab({
  library,
  libraryFilter,
  setLibraryFilter,
  colors,
  getAllTypes,
  renderGrid,
}) {
  const filtered =
    libraryFilter === "ALL"
      ? library
      : library.filter((x) => x.type === libraryFilter);
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.largeTitle, { color: colors.text }]}>
            Library
          </Text>
          <Text style={[styles.subCount, { color: colors.sub }]}>
            {library.length} items
          </Text>
        </View>
      </View>
      {library.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color={colors.card2} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Empty</Text>
          <Text style={[styles.emptyText, { color: colors.sub }]}>
            Save items to watch later
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 16 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 16 }}
          >
            {["ALL", ...getAllTypes()].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setLibraryFilter(t)}
                style={[
                  styles.homePillFixed,
                  {
                    backgroundColor:
                      libraryFilter === t ? colors.pillActiveBg : colors.card,
                    borderWidth: libraryFilter === t ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.homePillText,
                    {
                      color:
                        libraryFilter === t
                          ? colors.pillActiveText
                          : colors.sub,
                    },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {renderGrid(
            libraryFilter === "ALL"
              ? library
              : library.filter((x) => x._type === libraryFilter),
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}
