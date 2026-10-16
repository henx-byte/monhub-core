import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { styles } from "../styles/styles.js";

export function HomeTab({ homeData, activeHomeType, setActiveHomeType, colors, setSelected, setDetailData }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.largeTitle, { color: colors.text }]}>Home</Text>
      <Text style={{ color: colors.sub, marginTop: 4 }}>{Object.keys(homeData).length} sources loaded</Text>
      {/* Pills */}
      <View style={[styles.stickyPillContainer, { flexDirection: "row", gap: 8, marginTop: 12 }]}>
        {["ALL", "ANIME", "MANGA"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setActiveHomeType(t)} style={[styles.homePillFixed, { backgroundColor: activeHomeType === t ? colors.pillActiveBg : colors.card2 }]}>
            <Text style={[styles.homePillText, { color: activeHomeType === t ? colors.pillActiveText : colors.text }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Grid */}
      <View style={[styles.grid, { gap: 12 }]}>
        {(homeData[activeHomeType] || homeData["ALL"] || []).map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.gridCard, { width: "48%" }]}
            onPress={() => {
              setSelected(item);
              setDetailData(item);
            }}
          >
            <View style={styles.poster}>
              <Image source={{ uri: item.coverImage?.extraLarge || item.coverImage?.large }} style={styles.posterImg} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title?.english || item.title?.romaji}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.sub }]}>{item.seasonYear || ""}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
