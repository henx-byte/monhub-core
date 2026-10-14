
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';

const TRENDING = [
  { id: 1, title: 'Frieren', year: '2023', score: '91%', color: '#E8E0FF' },
  { id: 2, title: 'One Piece', year: '1999', score: '89%', color: '#FFE0E0' },
  { id: 3, title: 'Sousou', year: '2024', score: '88%', color: '#E0FFE8' },
  { id: 4, title: 'Jujutsu', year: '2023', score: '87%', color: '#E0F0FF' },
  { id: 5, title: 'Solo Leveling', year: '2024', score: '85%', color: '#FFF5E0' },
  { id: 6, title: 'Dandadan', year: '2024', score: '86%', color: '#F0E0FF' },
];

const CONTINUE = [
  { id: 1, title: 'Frieren EP 12', progress: 0.65, color: '#E8E0FF' },
  { id: 2, title: 'One Piece 1112', progress: 0.3, color: '#FFE0E0' },
];

export default function App() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('home');

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      {tab === 'home' && !selected && (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.largeTitle}>Monhub</Text>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="settings" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#8E8E93" style={{ marginRight: 8 }} />
            <TextInput placeholder="Search anime, manga" placeholderTextColor="#8E8E93" style={styles.searchInput} />
          </View>
          <Text style={styles.sectionTitle}>Continue Watching</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {CONTINUE.map(c => (
              <TouchableOpacity key={c.id} style={[styles.continueCard, { backgroundColor: c.color }]} onPress={() => setSelected(c)}>
                <Text style={styles.continueTitle}>{c.title}</Text>
                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${c.progress * 100}%` }]} /></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.sectionTitle}>Trending Today</Text>
          <Text style={styles.sectionSub}>From AniList • Legal</Text>
          <View style={styles.grid}>
            {TRENDING.map(item => (
              <TouchableOpacity key={item.id} style={styles.gridCard} onPress={() => setSelected(item)}>
                <View style={[styles.poster, { backgroundColor: item.color }]}><Text style={styles.posterText}>{item.title[0]}</Text></View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.year} • {item.score}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      {selected && (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#0A84FF" /><Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={[styles.detailPoster, { backgroundColor: selected.color || '#E8E0FF' }]}><Text style={styles.detailPosterText}>{selected.title[0]}</Text></View>
          <Text style={styles.detailTitle}>{selected.title}</Text>
          <Text style={styles.detailMeta}>2024 • 91% • AniList Legal</Text>
          <TouchableOpacity style={styles.playBtn}><Ionicons name="play" size={18} color="#000" /><Text style={styles.playText}>  Play</Text></TouchableOpacity>
        </ScrollView>
      )}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => {setTab('home'); setSelected(null)}} style={styles.tabItem}>
          <Ionicons name={tab==='home' ? "home" : "home-outline"} size={22} color={tab==='home' ? "#FFFFFF" : "#8E8E93"} />
          <Text style={[styles.tabText, tab==='home' && styles.tabActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('search')} style={styles.tabItem}>
          <Ionicons name={tab==='search' ? "search" : "search-outline"} size={22} color={tab==='search' ? "#FFFFFF" : "#8E8E93"} />
          <Text style={[styles.tabText, tab==='search' && styles.tabActive]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('library')} style={styles.tabItem}>
          <Ionicons name={tab==='library' ? "library" : "library-outline"} size={22} color={tab==='library' ? "#FFFFFF" : "#8E8E93"} />
          <Text style={[styles.tabText, tab==='library' && styles.tabActive]}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('extensions')} style={styles.tabItem}>
          <Ionicons name={tab==='extensions' ? "extension-puzzle" : "extension-puzzle-outline"} size={22} color={tab==='extensions' ? "#FFFFFF" : "#8E8E93"} />
          <Text style={[styles.tabText, tab==='extensions' && styles.tabActive]}>Extensions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000', paddingTop: 40 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  largeTitle: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5 },
  settingsBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 14, height: 44, marginTop: 16 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 28, letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
  hScroll: { marginTop: 14 },
  continueCard: { width: 200, height: 110, borderRadius: 24, padding: 16, marginRight: 12, justifyContent: 'space-between' },
  continueTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  progressTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 2, marginTop: 12 },
  progressFill: { height: 4, backgroundColor: '#000', borderRadius: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14, paddingBottom: 120 },
  gridCard: { width: '31%', marginBottom: 18 },
  poster: { aspectRatio: 2/3, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  posterText: { fontSize: 36, fontWeight: '900', color: '#000' },
  cardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 8 },
  cardMeta: { color: '#8E8E93', fontSize: 11, marginTop: 2 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  backText: { color: '#0A84FF', fontSize: 17, marginLeft: 2 },
  detailPoster: { height: 320, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  detailPosterText: { fontSize: 96, fontWeight: '900', color: '#000' },
  detailTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 20 },
  detailMeta: { color: '#8E8E93', fontSize: 14, marginTop: 6 },
  playBtn: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 24, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  playText: { color: '#000000', fontSize: 17, fontWeight: '700' },
  tabBar: { position: 'absolute', bottom: 20, left: 16, right: 16, height: 72, backgroundColor: '#1C1C1E', borderRadius: 28, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 0.5, borderColor: '#2C2C2E', paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabText: { color: '#8E8E93', fontSize: 10, fontWeight: '600', marginTop: 2 },
  tabActive: { color: '#FFFFFF' },
});
