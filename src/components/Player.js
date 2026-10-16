import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";

let WebView = null;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {}

export function Player({ playingStream, setPlayingStream }) {
  if (!playingStream) return null;
  return (
    <View style={styles.playerOverlay}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerTitle} numberOfLines={1}>
          {playingStream.type === "manga" ? "Reader" : "Player"}
        </Text>
        <TouchableOpacity onPress={() => setPlayingStream(null)} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      {playingStream.type === "youtube" && WebView ? (
        <WebView style={styles.webview} source={{ uri: "https://www.youtube-nocookie.com/embed/" + playingStream.id + "?autoplay=1&playsinline=1&rel=0" }} allowsInlineMediaPlayback javaScriptEnabled domStorageEnabled allowsFullscreenVideo />
      ) : playingStream.type === "manga" && playingStream.images ? (
        <ScrollView style={{ flex: 1, backgroundColor: "#000" }}>
          {playingStream.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={{ width: "100%", height: 600 }} resizeMode="contain" />
          ))}
        </ScrollView>
      ) : playingStream.url ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: "#FFF", marginBottom: 12, textAlign: "center" }}>{playingStream.url}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(playingStream.url)} style={[styles.primaryBtn, { backgroundColor: "#FFF" }]}>
            <Text style={{ color: "#000", fontWeight: "700" }}>Open</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#FFF" }}>{JSON.stringify(playingStream).slice(0, 300)}</Text>
        </View>
      )}
    </View>
  );
}
