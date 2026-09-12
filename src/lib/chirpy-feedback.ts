const FEEDBACK_MESSAGES = [
  "世界在慢慢向你打开",
  "一点点也算前进",
  "小肥鸟为你骄傲！",
  "看，你做到了",
  "这一刻值得记住",
  "你比想象中更行",
  "给自己鼓个掌吧",
  "每一步都算数",
];

/** Shuffle each complete round; never repeat at a round boundary. */
export function createFeedbackRotation(random: () => number = Math.random) {
  let remaining: string[] = [];
  let previous: string | undefined;
  return () => {
    if (remaining.length === 0) {
      remaining = [...FEEDBACK_MESSAGES];
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      const last = remaining.length - 1;
      if (remaining[last] === previous) {
        [remaining[0], remaining[last]] = [remaining[last], remaining[0]];
      }
    }
    previous = remaining.pop()!;
    return previous;
  };
}

export const getRandomFeedback = createFeedbackRotation();
