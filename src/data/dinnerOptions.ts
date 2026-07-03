// Curated dinner options for date plans — typed data, not JSX (blueprint rule).

export type DinnerOption = {
  id: string;
  label: string;
  emoji: string;
};

export const dinnerOptions: DinnerOption[] = [
  { id: "italian", label: "Italian", emoji: "🍝" },
  { id: "sushi", label: "Sushi", emoji: "🍣" },
  { id: "tacos", label: "Tacos", emoji: "🌮" },
  { id: "ramen", label: "Ramen", emoji: "🍜" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { id: "seafood", label: "Seafood", emoji: "🦞" },
  { id: "dessert", label: "Dessert & coffee", emoji: "🍰" },
];

export function dinnerLabel(id: string): string {
  const opt = dinnerOptions.find((o) => o.id === id);
  return opt ? `${opt.emoji} ${opt.label}` : id;
}
