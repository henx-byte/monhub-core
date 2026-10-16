import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles.js";

export function TabBar({ tab, setTab, setSelected, colors }) {
  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: colors.tabBar, borderColor: colors.border },
      ]}
    >
      {[
        { k: "home", icon: "home", label: "Home" },
        { k: "search", icon: "search", label: "Search" },
        { k: "library", icon: "library", label: "Library" },
        { k: "extensions", icon: "extension-puzzle", label: "Sources" },
      ].map((t) => (
        <TouchableOpacity
          key={t.k}
          onPress={() => {
            setTab(t.k);
            setSelected(null);
          }}
          style={styles.tabItem}
        >
          <Ionicons
            name={tab === t.k ? t.icon : `${t.icon}-outline`}
            size={24}
            color={tab === t.k ? colors.text : colors.sub}
          />
          <Text
            style={[
              styles.tabText,
              { color: tab === t.k ? colors.text : colors.sub },
            ]}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
