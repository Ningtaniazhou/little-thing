// Task type definition shared across frontend and backend

export interface Task {
  id: number;
  category: string;
  text: string;
  minutes: string;
  soft: string; // encouraging message
}
