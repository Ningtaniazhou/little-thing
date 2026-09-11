import { getRandomTask } from "./tasks";

/** Color and task pool stay paired, including random draws. */
export const CHIRPY_THEMES = [
  { key: "reading", label: "读点东西", color: "#7dc2df", categories: ["读书", "读诗", "学习"] },
  { key: "creating", label: "动手创作", color: "#ee9fab", categories: ["写作", "艺术", "手工"] },
  { key: "living", label: "照顾生活", color: "#f5d467", categories: ["整理", "饮食", "生活"] },
  { key: "resting", label: "放松身心", color: "#9ccba4", categories: ["自然", "身体", "冥想"] },
  { key: "exploring", label: "随心探索", color: "#b8a0d6", categories: ["音乐", "探索", "善意", "惊喜"] },
];

export function drawChirpyTask(themeKey: string | null) {
  const theme = CHIRPY_THEMES.find(item => item.key === themeKey);
  const task = getRandomTask(theme?.categories);
  const colorIndex = CHIRPY_THEMES.findIndex(item => item.categories.includes(task.category));
  return { task, colorIndex: Math.max(0, colorIndex) };
}
