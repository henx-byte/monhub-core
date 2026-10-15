
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Image, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';

let WebView = null;
try { WebView = require('react-native-webview').WebView; } catch(e) {}
let DocumentPicker = null;
try { DocumentPicker = require('expo-document-picker'); } catch(e) {}
let FileSystem = null;
try { FileSystem = require('expo-file-system/legacy'); } catch(e) {
  try { FileSystem = require('expo-file-system'); } catch(e2) {}
}

function stripHtml(html) { if (!html) return ''; return html.replace(/<[^>]*>?/gm, '').slice(0,300)+'...'; }

// ========== $x Helper - internal, no UI mention ==========
function createXPathHelper() {
  function $x(xpath, htmlInput) {
    if (!htmlInput || !xpath) return [];
    let html = typeof htmlInput === 'string' ? htmlInput : htmlInput.innerHTML || htmlInput.outerHTML || '';
    if (!html) return [];
    let normalized = xpath.replace(/id\(['\"](.*?)['\"]\)/g, "*[@id='$1']");
    const parts = normalized.split('/').filter(p => p.length > 0);
    let results = [html];
    for (let part of parts) {
      if (!part) continue;
      if (part === '') continue;
      let tag = '*'; let attrName = null; let attrValue = null; let index = null;
      const tagMatch = part.match(/^([\w\*]+)/);
      if (tagMatch) tag = tagMatch[1];
      const attrMatch = part.match(/\[@(\w+)=['\"](.*?)['\"]\]/);
      if (attrMatch) { attrName = attrMatch[1]; attrValue = attrMatch[2]; }
      const indexMatch = part.match(/\[(\d+)\]$/);
      if (indexMatch) index = parseInt(indexMatch[1], 10) - 1;
      let newResults = [];
      for (let chunk of results) {
        let regexPattern;
        if (tag === '*') {
          if (attrName && attrValue) {
            const escapedVal = attrValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regexPattern = `<[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*>([\\s\\S]*?)<\/[^>]+>|<[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*\/?>`;
          } else {
            regexPattern = `<([a-zA-Z][\\w-]*)[^>]*>([\\s\\S]*?)<\/\\1>`;
          }
        } else {
          if (attrName && attrValue) {
            const escapedVal = attrValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regexPattern = `<${tag}[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*>([\\s\\S]*?)<\/${tag}>|<${tag}[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*\/?>`;
          } else {
            regexPattern = `<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>|<${tag}[^>]*\/?>`;
          }
        }
        try {
          const re = new RegExp(regexPattern, 'gi');
          let m; let found = [];
          while ((m = re.exec(chunk)) !== null) { found.push(m[0]); if (found.length > 50) break; }
          if (index !== null) { if (found[index]) newResults.push(found[index]); } else { newResults.push(...found); }
        } catch(e) { console.log(`$x err ${part}: ${e.message}`); }
      }
      results = newResults;
      if (results.length === 0) break;
    }
    return results;
  }
  $x.text = (els) => { if (!els) return []; const arr = Array.isArray(els) ? els : [els]; return arr.map(el => el ? el.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''); };
  $x.attr = (els, name) => { if (!els) return []; const arr = Array.isArray(els) ? els : [els]; return arr.map(el => { const m = el.match(new RegExp(`${name}=['\"](.*?)['\"]`, 'i')); return m ? m[1] : null; }); };
  return $x;
}
const GLOBAL_XPATH = createXPathHelper();

export default function App() {
  const [selected, setSelected] = useState(null);
  const [isManga, setIsManga] = useState(false);
  const [tab, setTab] = useState('extensions');
  const [activeHomeType, setActiveHomeType] = useState('ALL');
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [searchType, setSearchType] = useState('ALL');
  const [searchResults, setSearchResults] = useState({});
  const [searchDisplayCount, setSearchDisplayCount] = useState({});
  const [searching, setSearching] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libraryFilter, setLibraryFilter] = useState('ALL');
  const [playingStream, setPlayingStream] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [extensions, setExtensions] = useState({});
  const [extUrl, setExtUrl] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);

  let AsyncStorage = null;
  try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch(e) {}

  const colors = theme === 'dark' ? {
    bg: '#000000', card: '#1C1C1E', card2: '#2C2C2E', text: '#FFFFFF', sub: '#8E8E93', sub2: '#AEAEB2', tabBar: '#18181B', pillActiveBg: '#FFFFFF', pillActiveText: '#000000', border: '#27272A'
  } : {
    bg: '#F2F2F7', card: '#FFFFFF', card2: '#E5E5EA', text: '#000000', sub: '#8E8E93', sub2: '#636366', tabBar: '#FFFFFF', pillActiveBg: '#000000', pillActiveText: '#FFFFFF', border: '#E4E4E7'
  };

  useEffect(() => {
    console.log('[CORE v27 Search 9 + Player Top Fix]');
    if (AsyncStorage) {
      AsyncStorage.getItem('moonhub_library').then(v => { if (v) setLibrary(JSON.parse(v)); }).catch(()=>{});
      AsyncStorage.getItem('moonhub_theme').then(v => { if (v) setTheme(v); }).catch(()=>{});
      AsyncStorage.getItem('moonhub_extensions_v26').then(v => {
        if (v) {
          try {
            const parsed = JSON.parse(v);
            const hydrated = {};
            Object.entries(parsed).forEach(([id, ext]) => { hydrated[id] = createExtensionFromConfig(ext); });
            setExtensions(hydrated);
            if (Object.keys(hydrated).length > 0) setTab('home');
            setTimeout(() => fetchAllPopular(hydrated), 500);
          } catch(e) { console.log(`[LOAD ERR] ${e.message}`); }
        }
      });
    }
  }, []);

  useEffect(() => { if (AsyncStorage) AsyncStorage.setItem('moonhub_library', JSON.stringify(library)).catch(()=>{}); }, [library]);
  useEffect(() => { if (AsyncStorage) AsyncStorage.setItem('moonhub_theme', theme).catch(()=>{}); }, [theme]);
  useEffect(() => {
    if (AsyncStorage) {
      const toSave = {};
      Object.entries(extensions).forEach(([id, ext]) => {
        toSave[id] = { id: ext.id, name: ext.name, supportedTypes: ext.supportedTypes, enabled: ext.enabled, version: ext.version, source: ext._source, popularCode: ext._popularCode, searchCode: ext._searchCode, detailCode: ext._detailCode, streamCode: ext._streamCode };
      });
      AsyncStorage.setItem('moonhub_extensions_v26', JSON.stringify(toSave));
    }
  }, [extensions]);

  const getAllTypes = () => {
    const types = new Set();
    Object.values(extensions).forEach(ext => { if (ext.enabled && ext.supportedTypes) ext.supportedTypes.forEach(t => types.add(t)); });
    return Array.from(types);
  };

  function createExtensionFromConfig(config) {
    const { id, name, supportedTypes, popularCode, searchCode, detailCode, streamCode } = config;
    const errors = [];
    if (!id) errors.push('id');
    if (!name) errors.push('name');
    if (!supportedTypes || !Array.isArray(supportedTypes) || supportedTypes.length === 0) errors.push('supportedTypes');
    if (!popularCode) errors.push('popularCode');
    if (!searchCode) errors.push('searchCode');
    if (errors.length > 0) {
      console.log(`[CREATE FAIL] ${id || 'unknown'}: ${errors.join(', ')}`);
      return { id: id || `fail_${Date.now()}`, name: name || 'Invalid', supportedTypes: supportedTypes || [], enabled: false, _source: config.source, _popularCode: popularCode, _searchCode: searchCode, _detailCode: detailCode, _streamCode: streamCode, get: { popular: async () => ({ media: [], hasNext: false, error: errors.join(', ') }), search: async () => [], detail: async () => null, stream: async () => null } };
    }
    const exec = async (codeName, code, args, values) => {
      if (!code) return { error: `${codeName} missing` };
      try {
        const fn = new Function(...args, '$x', 'console', `return (async () => { ${code} })()`);
        return await fn(...values, GLOBAL_XPATH, console);
      } catch(e) {
        console.log(`[ERR] ${codeName} ${id}: ${e.message}`);
        return { error: `${codeName}: ${e.message}` };
      }
    };
    return {
      id, name, supportedTypes, enabled: config.enabled !== false, version: config.version || '1.0.0',
      _source: config.source || { type: 'manual' }, _popularCode: popularCode, _searchCode: searchCode, _detailCode: detailCode, _streamCode: streamCode,
      get: {
        popular: async (type, page=1) => {
          const res = await exec('popularCode', popularCode, ['type','page','fetch'], [type, page, fetch]);
          if (res && res.error) return res;
          if (!res) return { media: [], hasNext: false };
          if (Array.isArray(res)) return { media: res, hasNext: false };
          return res;
        },
        search: async (type, query) => {
          const res = await exec('searchCode', searchCode, ['type','query','fetch'], [type, query, fetch]);
          if (!res || res.error) return [];
          if (Array.isArray(res)) return res;
          if (res.media) return res.media;
          return [];
        },
        detail: async (itemId, type) => {
          if (!detailCode) return null;
          const res = await exec('detailCode', detailCode, ['id','type','fetch'], [itemId, type, fetch]);
          if (res && res.error) return null;
          return res;
        },
        stream: async (itemId, type) => {
          if (!streamCode) return null;
          const res = await exec('streamCode', streamCode, ['id','type','fetch'], [itemId, type, fetch]);
          if (res && res.error) return { error: res.error };
          return res;
        }
      }
    };
  }

  const fetchAllPopular = async (exts = null) => {
    const useExts = exts || extensions;
    if (Object.keys(useExts).length === 0) { setHomeData({}); setLoading(false); return; }
    setLoading(true);
    const newData = {};
    for (const ext of Object.values(useExts).filter(e => e.enabled)) {
      if (!ext.supportedTypes) continue;
      for (const type of ext.supportedTypes) {
        const key = `${ext.id}-${type}`;
        const result = await ext.get.popular(type, 1);
        newData[key] = { media: (result.media || []).map(m => ({ ...m, _sourceId: ext.id, _type: type })), hasNext: result.hasNext || false, page: 1, error: result.error || null };
      }
    }
    setHomeData(newData);
    setLoading(false);
  };

  const fetchMorePopular = async (extId, type) => {
    const key = `${extId}-${type}`;
    const current = homeData[key];
    if (!current || !current.hasNext) return;
    const nextPage = (current.page || 1) + 1;
    const ext = extensions[extId];
    const result = await ext.get.popular(type, nextPage);
    setHomeData(prev => ({ ...prev, [key]: { media: [...(prev[key]?.media || []), ...(result.media || []).map(m => ({ ...m, _sourceId: extId, _type: type }))], hasNext: result.hasNext, page: nextPage, error: result.error || null } }));
  };

  useEffect(() => {
    if (q.trim().length < 2) { setSearchResults({}); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const allTypes = searchType === 'ALL' ? getAllTypes() : [searchType];
      const results = {};
      for (const ext of Object.values(extensions).filter(e => e.enabled)) {
        let extResults = [];
        for (const type of allTypes) {
          if (!ext.supportedTypes.includes(type)) continue;
          const media = await ext.get.search(type, q, 1);
          extResults = [...extResults, ...(media || []).map(m => ({ ...m, _sourceId: ext.id, _type: type }))];
        }
        if (extResults.length > 0) results[ext.id] = extResults;
      }
      setSearchResults(results);
      // Reset display count to 9 per source
      const newCounts = {};
      Object.keys(results).forEach(k => newCounts[k] = 9);
      setSearchDisplayCount(newCounts);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [q, searchType, extensions]);

  const handleSelect = async (item) => {
    setIsManga(item._type !== 'ANIME');
    setSelected(item);
    setDetailData(null);
    const ext = extensions[item._sourceId];
    if (ext && ext._detailCode) {
      const detail = await ext.get.detail(item.id, item._type);
      if (detail) setDetailData(detail);
    }
  };

  const handleStream = async (item) => {
    const ext = extensions[item._sourceId];
    if (!ext || !ext._streamCode) {
      if (item.trailer?.id) setPlayingStream({ type: 'youtube', id: item.trailer.id });
      else Linking.openURL('https://www.youtube.com/results?search_query=' + encodeURIComponent((item.title.english||item.title.romaji)+' trailer'));
      return;
    }
    const stream = await ext.get.stream(item.id, item._type);
    if (!stream) return;
    if (stream.error) { Alert.alert('Error', stream.error); return; }
    setPlayingStream(stream);
  };

  const toggleLibrary = (item) => {
    const exists = library.find(x => x.id === item.id && x._sourceId === item._sourceId);
    if (exists) setLibrary(library.filter(x => !(x.id === item.id && x._sourceId === item._sourceId)));
    else setLibrary([...library, item]);
  };
  const isInLibrary = (id, sourceId) => library.some(x => x.id === id && x._sourceId === sourceId);

  const handleAddUrl = async () => {
    if (!extUrl.trim()) { Alert.alert('Enter URL'); return; }
    setAddingUrl(true);
    try {
      console.log(`[ADD URL] ${extUrl}`);
      const res = await fetch(extUrl.trim());
      const text = await res.text();
      let config;
      try { config = JSON.parse(text); } catch { throw new Error('URL does not return valid JSON'); }
      config.source = { type: 'url', url: extUrl.trim() };
      const ext = createExtensionFromConfig(config);
      if (!ext.id || !ext._popularCode) throw new Error('Invalid extension: missing id or popularCode');
      const newExts = { ...extensions, [ext.id]: ext };
      setExtensions(newExts);
      setExtUrl('');
      setTimeout(() => fetchAllPopular(newExts), 300);
      setTab('home');
    } catch(e) {
      console.log(`[URL FAIL] ${e.message}`);
      Alert.alert('Failed to add', e.message);
    } finally { setAddingUrl(false); }
  };

  const handlePickFile = async () => {
    if (!DocumentPicker) { Alert.alert('File picker not available'); return; }
    try {
      // ONLY JSON
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith('.json')) { Alert.alert('Invalid file', 'Please select a JSON file'); return; }
      let content = '';
      try { const r = await fetch(file.uri); content = await r.text(); } catch { if (FileSystem) { try { content = await FileSystem.readAsStringAsync(file.uri); } catch {} } }
      if (!content) { Alert.alert('Read Failed', 'File is empty'); return; }
      let config;
      try { config = JSON.parse(content); } catch { Alert.alert('Invalid JSON', 'File is not valid JSON'); return; }
      const ext = createExtensionFromConfig(config);
      if (!ext.id || !ext._popularCode) { Alert.alert('Invalid Extension', 'Missing required fields: id, name, supportedTypes, popularCode, searchCode'); return; }
      const newExts = { ...extensions, [ext.id]: ext };
      setExtensions(newExts);
      setTimeout(() => fetchAllPopular(newExts), 300);
      setTab('home');
    } catch(e) { Alert.alert('Failed', e.message); }
  };

  const renderHorizontalList = (data) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingRight: 20, gap: 12 }}>
      {data.map(item => (
        <TouchableOpacity key={`${item._sourceId}-${item._type}-${item.id}`} style={{ width: 132 }} onPress={() => handleSelect(item)}>
          <View style={[styles.poster, { backgroundColor: colors.card, height: 184 }]}>
            <Image source={{ uri: item.coverImage.extraLarge || item.coverImage.large }} style={styles.posterImg} />
            {isInLibrary(item.id, item._sourceId) ? <View style={styles.badge}><Ionicons name="bookmark" size={10} color="#000" /></View> : null}
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title.english || item.title.romaji}</Text>
          <Text style={[styles.cardMeta, { color: colors.sub }]} numberOfLines={1}>{item._type}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderGrid = (data) => (
    <View style={[styles.grid, { gap: 12 }]}>
      {data.map(item => (
        <TouchableOpacity key={`${item._sourceId}-${item._type}-${item.id}`} style={[styles.gridCard, { width: '31%' }]} onPress={() => handleSelect(item)}>
          <View style={[styles.poster, { backgroundColor: colors.card }]}>
            <Image source={{ uri: item.coverImage.extraLarge || item.coverImage.large }} style={styles.posterImg} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title.english || item.title.romaji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getTypes = getAllTypes();
  const homePills = ['ALL', ...getTypes];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} /><StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {tab === 'home' && !selected && (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
          <View style={styles.header}>
            <View><Text style={[styles.largeTitle, { color: colors.text }]}>Home</Text></View>
            <TouchableOpacity onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={[styles.themeBtn, { backgroundColor: colors.card }]}><Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={18} color={colors.text} /></TouchableOpacity>
          </View>
          
          <View style={[styles.stickyPillContainer, { backgroundColor: colors.bg }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
              {homePills.map(t => (
                <TouchableOpacity key={t} onPress={() => setActiveHomeType(t)} style={[styles.homePillFixed, { backgroundColor: activeHomeType===t ? colors.pillActiveBg : colors.card, borderWidth: activeHomeType===t ? 0 : 1, borderColor: colors.border }]}>
                  <Text style={[styles.homePillText, { color: activeHomeType===t ? colors.pillActiveText : colors.sub }]}>{t === 'ALL' ? 'All' : t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {Object.keys(extensions).length === 0 ? (
            <View style={[styles.empty, {marginTop:100},{paddingTop:80}]}>
              <Ionicons name="extension-puzzle-outline" size={56} color={colors.card2} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No sources yet</Text>
              <Text style={[styles.emptyText, { color: colors.sub }]}>Add a source to discover anime and manga</Text>
              <TouchableOpacity onPress={() => setTab('extensions')} style={[styles.primaryBtn, { backgroundColor: colors.text, marginTop: 20, paddingHorizontal:10, height:30 }]}><Text style={[styles.primaryBtnText, { color: colors.bg }]}>Add Source</Text></TouchableOpacity>
            </View>
          ) : loading ? <View style={{ marginTop: 60 }}><ActivityIndicator size="large" color={colors.text} /></View> :
            Object.entries(homeData).filter(([key]) => activeHomeType === 'ALL' || key.endsWith(`-${activeHomeType}`)).map(([key, data]) => {
              const [extId, ...typeParts] = key.split('-');
              const type = typeParts.join('-');
              const ext = extensions[extId];
              return (
                <View key={key} style={{ marginTop: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{type}</Text>
                    {data.hasNext && <TouchableOpacity onPress={() => fetchMorePopular(extId, type)} style={[styles.smallBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>More</Text></TouchableOpacity>}
                  </View>
                  {data.error ? <View style={[styles.errorBox, { backgroundColor: colors.card }]}><Text style={{ color: '#EF4444', fontSize: 12 }}>{data.error}</Text></View> : null}
                  {data.media.length === 0 && !data.error ? <View style={[styles.emptySmall, { backgroundColor: colors.card }]}><Text style={{ color: colors.sub, fontSize: 13 }}>No content</Text></View> : renderHorizontalList(data.media)}
                </View>
              );
            })
          }
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {tab === 'search' && !selected && (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.header}><View><Text style={[styles.largeTitle, { color: colors.text }]}>Search</Text></View></View>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
            <Feather name="search" size={18} color={colors.sub} style={{ marginRight: 10 }} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search anime, manga..." placeholderTextColor={colors.sub} style={[styles.searchInput, { color: colors.text }]} autoFocus />
            {q.length > 0 && <TouchableOpacity onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={colors.sub} /></TouchableOpacity>}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
            {['ALL', ...getAllTypes()].map(t => (
              <TouchableOpacity key={t} onPress={() => setSearchType(t)} style={[styles.homePillFixed, { backgroundColor: searchType===t ? colors.pillActiveBg : colors.card, borderWidth: searchType===t ? 0 : 1, borderColor: colors.border }]}><Text style={[styles.homePillText, { color: searchType===t ? colors.pillActiveText : colors.sub }]}>{t}</Text></TouchableOpacity>
            ))}
          </ScrollView>
          {searching ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.text} /> :
           q.length < 2 ? <View style={styles.empty}><Ionicons name="search-outline" size={40} color={colors.card2} /><Text style={[styles.emptyText, { color: colors.sub, marginTop: 12 }]}>Type to search</Text></View> :
           <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16, flex: 1 }}>
             {Object.entries(searchResults).length === 0 ? <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.sub }]}>No results for "{q}"</Text></View> :
               Object.entries(searchResults).map(([extId, media]) => {
                 const displayCount = searchDisplayCount[extId] || 9;
                 const displayed = media.slice(0, displayCount);
                 const hasMore = media.length > displayCount;
                 return (
                   <View key={extId} style={{ marginTop: 5 }}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 }]}>{extensions[extId]?.name} • {media.length}</Text>
                       {hasMore && <TouchableOpacity onPress={() => setSearchDisplayCount(prev => ({ ...prev, [extId]: (prev[extId] || 9) + 9 }))} style={[styles.smallBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>More</Text></TouchableOpacity>}
                     </View>
                     <View style={{ marginTop: 12 }}>{renderGrid(displayed)}</View>
                     {hasMore && <TouchableOpacity onPress={() => setSearchDisplayCount(prev => ({ ...prev, [extId]: (prev[extId] || 9) + 9 }))} style={[styles.secondaryBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 12, height: 44 }]}><Text style={[styles.secondaryBtnText, { color: colors.text }]}>Load more ({media.length - displayCount} remaining)</Text></TouchableOpacity>}
                   </View>
                 );
               })
             }
             <View style={{ height: 140 }} />
           </ScrollView>
          }
        </View>
      )}

      {tab === 'library' && !selected && (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.header}><View><Text style={[styles.largeTitle, { color: colors.text }]}>Library</Text><Text style={[styles.subCount, { color: colors.sub }]}>{library.length} items</Text></View></View>
          {library.length === 0 ? <View style={styles.empty}><Ionicons name="bookmark-outline" size={56} color={colors.card2} /><Text style={[styles.emptyTitle, { color: colors.text }]}>Empty</Text><Text style={[styles.emptyText, { color: colors.sub }]}>Save items to watch later</Text></View> :
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
                {['ALL', ...getAllTypes()].map(t => (
                  <TouchableOpacity key={t} onPress={() => setLibraryFilter(t)} style={[styles.homePillFixed, { backgroundColor: libraryFilter===t ? colors.pillActiveBg : colors.card, borderWidth: libraryFilter===t ? 0 : 1, borderColor: colors.border }]}><Text style={[styles.homePillText, { color: libraryFilter===t ? colors.pillActiveText : colors.sub }]}>{t}</Text></TouchableOpacity>
                ))}
              </ScrollView>
              {renderGrid(libraryFilter === 'ALL' ? library : library.filter(x => x._type === libraryFilter))}
              <View style={{ height: 120 }} />
            </ScrollView>
          }
        </View>
      )}

      {tab === 'extensions' && (
        <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}><View><Text style={[styles.largeTitle, { color: colors.text }]}>Sources</Text><Text style={[styles.subCount, { color: colors.sub }]}>{Object.keys(extensions).length} added</Text></View></View>
          
          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Add from URL</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 8 }]}>
            <Feather name="link" size={16} color={colors.sub} style={{ marginRight: 10 }} />
            <TextInput value={extUrl} onChangeText={setExtUrl} placeholder="https://example.com/extension.json" placeholderTextColor={colors.sub} style={[styles.urlInput, { color: colors.text }]} autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity onPress={handleAddUrl} disabled={addingUrl || !extUrl.trim()} style={[styles.addUrlBtn, { backgroundColor: extUrl.trim() ? colors.text : colors.card2 }]}>{addingUrl ? <ActivityIndicator size="small" color={colors.bg} /> : <Text style={{ color: extUrl.trim() ? colors.bg : colors.sub, fontWeight: '600', fontSize: 10 }}>Add</Text>}</TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Add from File</Text>
          <TouchableOpacity onPress={handlePickFile} style={[styles.fileCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', marginTop: 8 }]}>
            <View style={[styles.fileIcon, { backgroundColor: colors.bg }]}><Ionicons name="document-outline" size={22} color={colors.text} /></View>
            <View style={{ flex: 1 }}><Text style={[styles.fileTitle, { color: colors.text }]}>Select JSON file</Text><Text style={[styles.fileSub, { color: colors.sub }]}>Only .json files are accepted</Text></View>
            <Ionicons name="chevron-forward" size={16} color={colors.sub} />
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text, marginTop: 28 }]}>Installed Sources</Text>
          {Object.values(extensions).length === 0 ? <View style={[styles.emptySmall, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 12 }]}><Text style={{ color: colors.sub, fontSize: 13, textAlign: 'center' }}>No sources added yet. Add from URL or file above.</Text></View> :
            <View style={{ marginTop: 12, gap: 10 }}>
              {Object.values(extensions).map(ext => {
                const features = [];
                if (ext._popularCode) features.push('popular: yes');
                if (ext._searchCode) features.push('search: yes');
                if (ext._detailCode) features.push('detail: yes');
                if (ext._streamCode) features.push('stream: yes');
                return (
                  <View key={ext.id} style={[styles.sourceCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                    <View style={[styles.sourceIcon, { backgroundColor: ext.enabled ? '#10B981' : colors.card2 }]}><Ionicons name={ext.enabled ? "checkmark" : "close"} size={14} color="#FFF" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sourceName, { color: colors.text }]}>{ext.name}</Text>
                      <Text style={[styles.sourceMeta, { color: colors.sub }]}>{ext.supportedTypes.join(', ')}</Text>
                      <Text style={[styles.sourceFeatures, { color: colors.sub2 }]}>{features.join(' • ')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { const n = { ...extensions }; delete n[ext.id]; setExtensions(n); }} style={[styles.deleteBtn, { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }]}><Ionicons name="trash-outline" size={14} color="#EF4444" /></TouchableOpacity>
                  </View>
                );
              })}
            </View>
          }
          <View style={{ height: 140 }} />
        </ScrollView>
      )}

      {selected && (
        <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}><Ionicons name="chevron-back" size={20} color="#FFF" /><Text style={styles.backText}>Back</Text></TouchableOpacity>
          <View style={styles.detailRow}>
            <View style={[styles.detailPoster, { backgroundColor: colors.card }]}><Image source={{ uri: (detailData?.coverImage || selected.coverImage).extraLarge || selected.coverImage.large }} style={styles.detailImg} /></View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.detailTitle, { color: colors.text }]}>{(detailData?.title || selected.title).english || selected.title.romaji}</Text>
              <Text style={[styles.detailMeta, { color: colors.sub }]}>{selected._type}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>{(detailData?.genres || selected.genres || []).slice(0,3).map(g => <View key={g} style={[styles.genrePill, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}><Text style={[styles.genreText, { color: colors.sub }]}>{g}</Text></View>)}</View>
            </View>
          </View>
          <Text style={[styles.synopsis, { color: colors.sub2 }]}>{stripHtml(detailData?.description || selected.description)}</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.text, marginTop: 20 }]} onPress={() => handleStream(selected)}>
            <Ionicons name="play" size={18} color={colors.bg} /><Text style={[styles.primaryBtnText, { color: colors.bg }]}>  Watch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: isInLibrary(selected.id, selected._sourceId) ? colors.text : colors.card, borderWidth: 1, borderColor: isInLibrary(selected.id, selected._sourceId) ? colors.text : colors.border }]} onPress={() => toggleLibrary(selected)}>
            <Ionicons name={isInLibrary(selected.id, selected._sourceId) ? "checkmark" : "bookmark-outline"} size={18} color={isInLibrary(selected.id, selected._sourceId) ? colors.bg : colors.text} />
            <Text style={[styles.secondaryBtnText, { color: isInLibrary(selected.id, selected._sourceId) ? colors.bg : colors.text }]}>{isInLibrary(selected.id, selected._sourceId) ? '  Saved' : '  Save'}</Text>
          </TouchableOpacity>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {playingStream && (
        <View style={styles.playerOverlay}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerTitle} numberOfLines={1}>{playingStream.type === 'manga' ? 'Reader' : 'Player'}</Text>
            <TouchableOpacity onPress={() => setPlayingStream(null)} style={styles.closeBtn}><Ionicons name="close" size={20} color="#FFF" /></TouchableOpacity>
          </View>
          {playingStream.type === 'youtube' && WebView ? <WebView style={styles.webview} source={{ uri: 'https://www.youtube-nocookie.com/embed/' + playingStream.id + '?autoplay=1&playsinline=1&rel=0' }} allowsInlineMediaPlayback javaScriptEnabled domStorageEnabled allowsFullscreenVideo /> :
           playingStream.type === 'manga' && playingStream.images ? <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>{playingStream.images.map((img, i) => <Image key={i} source={{ uri: img }} style={{ width: '100%', height: 600 }} resizeMode="contain" />)}</ScrollView> :
           playingStream.url ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}><Text style={{ color: '#FFF', marginBottom: 12, textAlign: 'center' }}>{playingStream.url}</Text><TouchableOpacity onPress={() => Linking.openURL(playingStream.url)} style={[styles.primaryBtn, { backgroundColor: '#FFF' }]}><Text style={{ color: '#000', fontWeight: '700' }}>Open</Text></TouchableOpacity></View> :
           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF' }}>{JSON.stringify(playingStream).slice(0,300)}</Text></View>
          }
        </View>
      )}

      {/* FIXED TAB BAR - no text cut off */}
      <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
        {[
          { k: 'home', icon: 'home', label: 'Home' },
          { k: 'search', icon: 'search', label: 'Search' },
          { k: 'library', icon: 'library', label: 'Library' },
          { k: 'extensions', icon: 'extension-puzzle', label: 'Sources' },
        ].map(t => (
          <TouchableOpacity key={t.k} onPress={() => { setTab(t.k); setSelected(null); }} style={styles.tabItem}>
            <Ionicons name={tab===t.k ? t.icon : `${t.icon}-outline`} size={24} color={tab===t.k ? colors.text : colors.sub} />
            <Text style={[styles.tabText, { color: tab===t.k ? colors.text : colors.sub }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 44 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  largeTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subCount: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  themeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stickyPillContainer: { marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 10 },
  homePillFixed: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  homePillText: { fontSize: 13, fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, height: 38, marginTop: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, height: 38 },
  urlInput: { flex: 1, fontSize: 12 },
  addUrlBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, marginLeft: 8 },
  searchInput: { flex: 1, fontSize: 12 },
  label: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  gridCard: { marginBottom: 8 },
  poster: { aspectRatio: 2/3, borderRadius: 14, overflow: 'hidden' },
  posterImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFF', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '600', marginTop: 8, lineHeight: 16 },
  cardMeta: { fontSize: 11, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 16 },
  backText: { color: '#FFF', fontSize: 16, marginLeft: 2 },
  detailRow: { flexDirection: 'row' },
  detailPoster: { width: 100, height: 150, borderRadius: 14, overflow: 'hidden' },
  detailImg: { width: '100%', height: '100%' },
  detailTitle: { fontSize: 19, fontWeight: '800', lineHeight: 23 },
  detailMeta: { fontSize: 12, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  genrePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  genreText: { fontSize: 10, fontWeight: '600' },
  synopsis: { fontSize: 14, lineHeight: 20, marginTop: 18 },
  primaryBtn: { flexDirection: 'row', borderRadius: 14, height: 50, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { fontSize: 12, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', borderRadius: 14, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 14 },
  emptyText: { fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 14 },
  emptySmall: { padding: 10, borderRadius: 12, alignItems: 'center' },
  errorBox: { padding: 10, borderRadius: 10, marginTop: 10 },
  fileCard: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fileTitle: { fontWeight: '600', fontSize: 14 },
  fileSub: { fontSize: 12, marginTop: 2 },
  sourceCard: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sourceIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sourceName: { fontWeight: '600', fontSize: 14 },
  sourceMeta: { fontSize: 12, marginTop: 1 },
  sourceFeatures: { fontSize: 11, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  playerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 100, paddingTop: Platform.OS === 'ios' ? 54 : 48 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: '#000' },
  playerTitle: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#27272A', justifyContent: 'center', alignItems: 'center' },
  webview: { flex: 1, backgroundColor: '#000' },
  // FIXED TAB BAR - prevents text cut off
  tabBar: { position: 'absolute', bottom: 20, left: 16, right: 16, height: 66, borderRadius: 28, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, paddingBottom: 10, paddingTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  tabText: { fontSize: 11, fontWeight: '600', marginTop: 4, lineHeight: 12 },
});
