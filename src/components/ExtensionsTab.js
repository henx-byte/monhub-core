import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";

export function ExtensionsTab({ extensions, extUrl, setExtUrl, addingUrl, handleAddUrl, handlePickFile, setExtensions, colors }) {
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.largeTitle, { color: colors.text }]}>Sources</Text>
          <Text style={[styles.subCount, { color: colors.sub }]}>{Object.keys(extensions).length} added</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Add from URL</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 8 }]}>
        <Feather name="link" size={16} color={colors.sub} style={{ marginRight: 10 }} />
        <TextInput value={extUrl} onChangeText={setExtUrl} placeholder="https://example.com/extension.json" placeholderTextColor={colors.sub} style={[styles.urlInput, { color: colors.text }]} autoCapitalize="none" autoCorrect={false} />
        <TouchableOpacity onPress={handleAddUrl} disabled={addingUrl || !extUrl.trim()} style={[styles.addUrlBtn, { backgroundColor: extUrl.trim() ? colors.text : colors.card2 }]}>
          {addingUrl ? <ActivityIndicator size="small" color={colors.bg} /> : <Text style={{ color: extUrl.trim() ? colors.bg : colors.sub, fontWeight: "600", fontSize: 10 }}>Add</Text>}
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Add from File</Text>
      <TouchableOpacity onPress={handlePickFile} style={[styles.fileCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", marginTop: 8 }]}>
        <View style={[styles.fileIcon, { backgroundColor: colors.bg }]}>
          <Ionicons name="document-outline" size={22} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fileTitle, { color: colors.text }]}>Select JSON file</Text>
          <Text style={[styles.fileSub, { color: colors.sub }]}>Only .json files are accepted</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.sub} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text, marginTop: 28 }]}>Installed Sources</Text>
      {Object.values(extensions).length === 0 ? (
        <View style={[styles.emptySmall, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 12 }]}>
          <Text style={{ color: colors.sub, fontSize: 13, textAlign: "center" }}>No sources added yet. Add from URL or file above.</Text>
        </View>
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          {Object.values(extensions).map((ext) => {
            const features = [];
            if (ext._popularCode) features.push("popular: yes");
            if (ext._searchCode) features.push("search: yes");
            if (ext._detailCode) features.push("detail: yes");
            if (ext._streamCode) features.push("stream: yes");
            return (
              <View key={ext.id} style={[styles.sourceCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <View style={[styles.sourceIcon, { backgroundColor: ext.enabled ? "#10B981" : colors.card2 }]}>
                  <Ionicons name={ext.enabled ? "checkmark" : "close"} size={14} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sourceName, { color: colors.text }]}>{ext.name}</Text>
                  <Text style={[styles.sourceMeta, { color: colors.sub }]}>{ext.supportedTypes.join(", ")}</Text>
                  <Text style={[styles.sourceFeatures, { color: colors.sub2 }]}>{features.join(" • ")}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const n = { ...extensions };
                    delete n[ext.id];
                    setExtensions(n);
                  }}
                  style={[styles.deleteBtn, { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }]}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ height: 140 }} />
    </ScrollView>
  );
}
