import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { styles } from "../styles/styles.js";

export function LibraryTab({ library, libraryFilter, setLibraryFilter, colors, setSelected }) {
  const filtered = libraryFilter === "ALL" ? library : library.filter((x) => x.type === libraryFilter);
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.largeTitle, { color: colors.text }]}>Library</Text>
      <Text style={[styles.subCount, { color: colors.sub }]}>{library.length} items</Text>
      <ScrollView style={{ marginTop: 16 }}>
        <View style={[styles.grid, { gap: 12 }]}>
          {filtered.map((item, i) => (
            <TouchableOpacity key={i} style={{ width: "48%" }} onPress={() => setSelected(item)}>
              <View style={styles.poster}>
                <Image source={{ uri: item.coverImage?.large }} style={styles.posterImg} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title?.english || item.title?.romaji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
