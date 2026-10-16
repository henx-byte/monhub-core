import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";

let WebView = null;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {}

export function PlayerStream({ playingStream, setPlayingStream }) {
  if (!playingStream) return null;
  console.log(playingStream.url);

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; background-color: #000; overflow: hidden; }
        .video-container { position: relative; padding-bottom: 56.25%; left: 0; width: 100%; height: 0; }
        .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
      </style>
    </head>
    <body>
      <div class="video-container">
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer *; clipboard-write *; encrypted-media *; gyroscope *; picture-in-picture *; web-share *;" referrerpolicy="strict-origin"></iframe>
      </div>
    </body>
  </html> 
  `;
  return (
    <View style={styles.playerOverlay}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerTitle} numberOfLines={1}>
          {playingStream.type === "manga" ? "Reader" : "Player"}
        </Text>
        <TouchableOpacity
          onPress={() => setPlayingStream(null)}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      {playingStream.type === "youtube" && WebView ? (
        <WebView
          style={styles.webview}
          source={{ html: htmlContent }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
        />
      ) : playingStream.type === "manga" && playingStream.images ? (
        <ScrollView style={{ flex: 1, backgroundColor: "#000" }}>
          {playingStream.images.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img }}
              style={{ width: "100%", height: 600 }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
      ) : playingStream.url ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{ color: "#FFF", marginBottom: 12, textAlign: "center" }}
          >
            {playingStream.url}
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(playingStream.url)}
            style={[styles.primaryBtn, { backgroundColor: "#FFF" }]}
          >
            <Text style={{ color: "#000", fontWeight: "700" }}>Open</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF" }}>
            {JSON.stringify(playingStream).slice(0, 300)}
          </Text>
        </View>
      )}
    </View>
  );
}
