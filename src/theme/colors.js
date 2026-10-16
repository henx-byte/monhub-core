export const getColors = (theme) =>
  theme === "dark"
    ? {
        bg: "#000000",
        card: "#1C1C1E",
        card2: "#2C2C2E",
        text: "#FFFFFF",
        sub: "#8E8E93",
        sub2: "#AEAEB2",
        tabBar: "#18181B",
        pillActiveBg: "#FFFFFF",
        pillActiveText: "#000000",
        border: "#27272A",
      }
    : {
        bg: "#F2F2F7",
        card: "#FFFFFF",
        card2: "#E5E5EA",
        text: "#000000",
        sub: "#8E8E93",
        sub2: "#636366",
        tabBar: "#FFFFFF",
        pillActiveBg: "#000000",
        pillActiveText: "#FFFFFF",
        border: "#E4E4E7",
      };
