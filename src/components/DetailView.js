import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";
import { stripHtml } from "../helpers/xpath.js";

export function DetailView({ selected, detailData, colors, setSelected, setPlayingStream, library, setLibrary }) {
  if (!selected) return null;
  const data = detailData || selected;
  const isInLib = library.find((x) => x.id === data.id);
  return (
    <ScrollView>
      <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
      </TouchableOpacity>
      <View style={styles.detailRow}>
        <View style={styles.detailPoster}>
          <Image source={{ uri: data.coverImage?.extraLarge || data.coverImage?.large }} style={styles.detailImg} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>{data.title?.english || data.title?.romaji}</Text>
          <Text style={[styles.detailMeta, { color: colors.sub }]}>
            {data.seasonYear} • {data.status} • {data.averageScore}%
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {(data.genres || []).slice(0, 3).map((g) => (
              <View key={g} style={[styles.genrePill, { backgroundColor: colors.card2 }]}>
                <Text style={[styles.genreText, { color: colors.text }]}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.synopsis, { color: colors.text }]}>{stripHtml(data.description)}</Text>
      <TouchableOpacity onPress={() => setPlayingStream({ url: data.trailer ? `https://www.youtube.com/watch?v=${data.trailer.id}` : null, title: data.title?.english })} style={[styles.primaryBtn, { backgroundColor: colors.text, marginTop: 20 }]}>
        <Text style={[styles.primaryBtnText, { color: colors.bg }]}>▶ PLAY TRAILER</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (isInLib) setLibrary(library.filter((x) => x.id !== data.id));
          else setLibrary([...library, data]);
        }}
        style={[styles.secondaryBtn, { backgroundColor: colors.card2 }]}
      >
        <Text style={[styles.secondaryBtnText, { color: colors.text }]}>{isInLib ? "Remove from Library" : "+ Add to Library"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
