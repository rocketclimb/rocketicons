export const shuffle = (array: string[]) =>
  [...array].sort(() => Math.random() - 0.5);

export const colors = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export const variations = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

export const putVariantsOnIt = (colors: string[]) =>
  ([] as string[]).concat(
    ...colors.map((color) =>
      shuffle(variations)
        .slice(0, 3)
        .map((variant) => `${color}-${variant}`)
    )
  );
