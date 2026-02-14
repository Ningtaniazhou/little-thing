// Theme color configuration for each task category
// Each theme defines egg color, accent color, and accessory type for the fat bird

export type ThemeKey =
  | "文学"
  | "艺术"
  | "写作"
  | "音乐"
  | "放松"
  | "好奇心"
  | "生活"
  | "家庭"
  | "学习"
  | "学术"
  | "帮助";

export interface ThemeConfig {
  key: ThemeKey;
  label: string;
  eggColor: string; // main egg shell color
  eggColorDark: string; // darker shade for egg details
  accent: string; // accent color for bird accessory
  accessory: string; // accessory type identifier
}

export const themes: Record<string, ThemeConfig> = {
  文学: {
    key: "文学",
    label: "Literature",
    eggColor: "#E8DFF5",
    eggColorDark: "#C9B8E8",
    accent: "#9B7DC8",
    accessory: "scarf",
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
  放松: {
    key: "放松",
    label: "Relaxation",
    eggColor: "#D5F5E3",
    eggColorDark: "#A9DFBF",
    accent: "#58B075",
    accessory: "leaf",
  },
  好奇心: {
    key: "好奇心",
    label: "Curiosity",
    eggColor: "#FEF9E7",
    eggColorDark: "#F9E79F",
    accent: "#D4AC0D",
    accessory: "star",
  },
  生活: {
    key: "生活",
    label: "Life",
    eggColor: "#FDEBD0",
    eggColorDark: "#F5CBA7",
    accent: "#CA8944",
    accessory: "apron",
  },
  家庭: {
    key: "家庭",
    label: "Family",
    eggColor: "#FDEDEC",
    eggColorDark: "#F5B7B1",
    accent: "#E74C5E",
    accessory: "heart",
  },
  学习: {
    key: "学习",
    label: "Learning",
    eggColor: "#D4E6F1",
    eggColorDark: "#A9CCE3",
    accent: "#4A6FA5",
    accessory: "glasses",
  },
  学术: {
    key: "学术",
    label: "Academic",
    eggColor: "#D4E6F1",
    eggColorDark: "#A9CCE3",
    accent: "#4A6FA5",
    accessory: "glasses",
  },
  帮助: {
    key: "帮助",
    label: "Helping",
    eggColor: "#F5CBA7",
    eggColorDark: "#E8B480",
    accent: "#D68040",
    accessory: "wings-glow",
  },
};

// Get theme for a category, with fallback
export function getTheme(category: string): ThemeConfig {
  return (
    themes[category] ?? {
      key: "放松" as ThemeKey,
      label: "Default",
      eggColor: "#D5F5E3",
      eggColorDark: "#A9DFBF",
      accent: "#58B075",
      accessory: "leaf",
    }
  );
}
