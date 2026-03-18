// localStorage utilities for tracking weekly completion and category preferences

function getWeekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const wk = Math.floor(day / 7);
  return `little_thing_week_${d.getFullYear()}_${wk}`;
}

export function getWeekCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(getWeekKey()) || "0", 10);
}

export function incrementWeekCount(): number {
  const n = getWeekCount() + 1;
  localStorage.setItem(getWeekKey(), String(n));
  return n;
}

const CATEGORY_KEY = "jiujiu_selected_categories";

export function saveCategories(cats: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(cats));
}

export function loadCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CATEGORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
