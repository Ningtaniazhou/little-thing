// Theme color configuration for each task category

export type ThemeKey =
  | "读诗"
  | "读书"
  | "艺术"
  | "写作"
  | "音乐"
  | "冥想"
  | "身体"
  | "探索"
  | "自然"
  | "整理"
  | "饮食"
  | "学习"
  | "善意"
  | "手工"
  | "生活"
  | "惊喜";

export interface ThemeConfig {
  key: ThemeKey;
  label: string;
  eggColor: string;
  eggColorDark: string;
  accent: string;
  accessory: string;
}

export const themes: Record<string, ThemeConfig> = {
  读诗: {
    key: "读诗",
    label: "Poetry",
    eggColor: "#E8DFF5",
    eggColorDark: "#C9B8E8",
    accent: "#9B7DC8",
    accessory: "scarf",
  },
  读书: {
    key: "读书",
    label: "Reading",
    eggColor: "#D7CCC8",
    eggColorDark: "#BCAAA4",
    accent: "#795548",
    accessory: "bookmark",
  },
  艺术: {
    key: "艺术",
    label: "Art",
    eggColor: "#FFE5CC",
    eggColorDark: "#F5C89A",
    accent: "#E8943A",
    accessory: "beret",
  },
  写作: {
    key: "写作",
    label: "Writing",
    eggColor: "#D6EAF8",
    eggColorDark: "#AED6F1",
    accent: "#5DADE2",
    accessory: "bowtie",
  },
  音乐: {
    key: "音乐",
    label: "Music",
    eggColor: "#FADBD8",
    eggColorDark: "#F1948A",
    accent: "#E57498",
    accessory: "headphones",
  },
  冥想: {
    key: "冥想",
    label: "Meditation",
    eggColor: "#D5F5E3",
    eggColorDark: "#A9DFBF",
    accent: "#58B075",
    accessory: "leaf",
  },
  身体: {
    key: "身体",
    label: "Body",
    eggColor: "#FCE4EC",
    eggColorDark: "#F48FB1",
    accent: "#E91E63",
    accessory: "sweatband",
  },
  探索: {
    key: "探索",
    label: "Explore",
    eggColor: "#FEF9E7",
    eggColorDark: "#F9E79F",
    accent: "#D4AC0D",
    accessory: "star",
  },
  自然: {
    key: "自然",
    label: "Nature",
    eggColor: "#E8F5E9",
    eggColorDark: "#A5D6A7",
    accent: "#4CAF50",
    accessory: "sprout",
  },
  整理: {
    key: "整理",
    label: "Tidy",
    eggColor: "#FDEBD0",
    eggColorDark: "#F5CBA7",
    accent: "#CA8944",
    accessory: "apron",
  },
  饮食: {
    key: "饮食",
    label: "Food",
    eggColor: "#FFF3E0",
    eggColorDark: "#FFCC80",
    accent: "#FF9800",
    accessory: "chef",
  },
  学习: {
    key: "学习",
    label: "Learning",
    eggColor: "#D4E6F1",
    eggColorDark: "#A9CCE3",
    accent: "#4A6FA5",
    accessory: "glasses",
  },
  善意: {
    key: "善意",
    label: "Kindness",
    eggColor: "#F5CBA7",
    eggColorDark: "#E8B480",
    accent: "#D68040",
    accessory: "wings-glow",
  },
  手工: {
    key: "手工",
    label: "Craft",
    eggColor: "#F3E5F5",
    eggColorDark: "#CE93D8",
    accent: "#9C27B0",
    accessory: "scissors",
  },
  生活: {
    key: "生活",
    label: "Life",
    eggColor: "#ECEFF1",
    eggColorDark: "#B0BEC5",
    accent: "#607D8B",
    accessory: "calendar",
  },
  惊喜: {
    key: "惊喜",
    label: "Surprise",
    eggColor: "rainbow",
    eggColorDark: "rainbow",
    accent: "#FF6F61",
    accessory: "sparkle",
  },
};

export function getTheme(category: string): ThemeConfig {
  return (
    themes[category] ?? {
      key: "冥想" as ThemeKey,
      label: "Default",
      eggColor: "#D5F5E3",
      eggColorDark: "#A9DFBF",
      accent: "#58B075",
      accessory: "leaf",
    }
  );
}
