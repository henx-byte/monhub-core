import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";

export function SearchTab({ q, setQ, searchType, setSearchType, searchResults, searching, colors, onSearch, setSelected }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.searchBar, { backgroundColor: colors.card2 }]}>
        <Ionicons name="search" size={18} color={colors.sub} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search anime..." placeholderTextColor={colors.sub} style={[styles.searchInput, { color: colors.text, marginLeft: 8 }]} onSubmitEditing={onSearch} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        {["ALL", "ANIME"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setSearchType(t)} style={[styles.homePillFixed, { backgroundColor: searchType === t ? colors.pillActiveBg : colors.card2 }]}>
            <Text style={[styles.homePillText, { color: searchType === t ? colors.pillActiveText : colors.text }]}>{t}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onSearch} style={[styles.smallBtn, { backgroundColor: colors.text }]}>
          <Text style={{ color: colors.bg, fontWeight: "700" }}>{searching ? "..." : "Search"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ marginTop: 16 }}>
        <View style={[styles.grid, { gap: 12 }]}>
          {(searchResults[searchType] || searchResults["ALL"] || []).map((item, i) => (
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
