import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";
import { stripHtml } from "../helpers/xpath.js";

export function DetailView({
  selected,
  detailData,
  colors,
  setSelected,
  handleStream,
  isInLibrary,
}) {
  if (!selected) return null;
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => setSelected(null)}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={20} color="#FFF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.detailRow}>
        <View style={[styles.detailPoster, { backgroundColor: colors.card }]}>
          <Image
            source={{
              uri:
                (detailData?.coverImage || selected.coverImage).extraLarge ||
                selected.coverImage.large,
            }}
            style={styles.detailImg}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>
            {(detailData?.title || selected.title).english ||
              selected.title.romaji}
          </Text>
          <Text style={[styles.detailMeta, { color: colors.sub }]}>
            {selected._type}
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {(detailData?.genres || selected.genres || [])
              .slice(0, 3)
              .map((g) => (
                <View
                  key={g}
                  style={[
                    styles.genrePill,
                    {
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.genreText, { color: colors.sub }]}>
                    {g}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </View>
      <Text style={[styles.synopsis, { color: colors.sub2 }]}>
        {stripHtml(detailData?.description || selected.description)}
      </Text>
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: colors.text, marginTop: 20 },
        ]}
        onPress={() => handleStream(selected)}
      >
        <Ionicons name="play" size={18} color={colors.bg} />
        <Text style={[styles.primaryBtnText, { color: colors.bg }]}>
          {" "}
          Watch
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.secondaryBtn,
          {
            backgroundColor: isInLibrary(selected.id, selected._sourceId)
              ? colors.text
              : colors.card,
            borderWidth: 1,
            borderColor: isInLibrary(selected.id, selected._sourceId)
              ? colors.text
              : colors.border,
          },
        ]}
        onPress={() => toggleLibrary(selected)}
      >
        <Ionicons
          name={
            isInLibrary(selected.id, selected._sourceId)
              ? "checkmark"
              : "bookmark-outline"
          }
          size={18}
          color={
            isInLibrary(selected.id, selected._sourceId)
              ? colors.bg
              : colors.text
          }
        />
        <Text
          style={[
            styles.secondaryBtnText,
            {
              color: isInLibrary(selected.id, selected._sourceId)
                ? colors.bg
                : colors.text,
            },
          ]}
        >
          {isInLibrary(selected.id, selected._sourceId) ? "  Saved" : "  Save"}
        </Text>
      </TouchableOpacity>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}
