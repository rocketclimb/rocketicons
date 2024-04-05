export const shuffle = (array: string[]) =>
  [...array].sort(() => Math.random() - 0.5);

// export const sizes = [
//   "xs",
//   "sm",
//   "base",
//   "lg",
//   "xl",
//   "2xl",
//   "3xl",
//   "4xl",
//   "5xl",
//   "6xl",
//   "7xl",
// ];

export const otherSizes = [
  "size-5",
  "size-10",
  "size-14",
  "h-2 w-2",
  "h-4 w-4",
  "h-7 w-7",
  "h-9 w-9",
];

export const sizes = {
  xs: {
    tw: "size-2",
    props: [
      { width: "0.5rem", comment: "8px" },
      { height: "0.5rem", comment: "8px" },
    ],
  },
  sm: {
    tw: "size-4",
    props: [
      { width: "1rem;", comment: "16px" },
      { height: "1rem", comment: "16px" },
    ],
  },
  base: {
    tw: "size-5",
    props: [
      { width: "1.25rem;", comment: "20px" },
      { height: "1.25rem", comment: "20px" },
    ],
  },
  lg: {
    tw: "size-6",
    props: [
      { width: "1.5rem;", comment: "24px" },
      { height: "1.5rem", comment: "24px" },
    ],
  },
  xl: {
    tw: "size-7",
    props: [
      { width: "1.75rem;", comment: "28px" },
      { height: "1.75rem", comment: "28px" },
    ],
  },
  "2xl": {
    tw: "size-8",
    props: [
      { width: "2rem;", comment: "32px" },
      { height: "2rem", comment: "32px" },
    ],
  },
  "3xl": {
    tw: "size-9",
    props: [
      { width: "2.25rem;", comment: "36px" },
      { height: "2.25rem", comment: "36px" },
    ],
  },
  "4xl": {
    tw: "size-10",
    props: [
      { width: "2.5rem;", comment: "40px" },
      { height: "2.5rem", comment: "40px" },
    ],
  },
  "5xl": {
    tw: "size-11",
    props: [
      { width: "2.75rem;", comment: "44px" },
      { height: "2.75rem", comment: "44px" },
    ],
  },
  "6xl": {
    tw: "size-12",
    props: [
      { width: "3rem;", comment: "48px" },
      { height: "3rem", comment: "48px" },
    ],
  },
  "7xl": {
    tw: "size-14",
    props: [
      { width: "3.5rem;", comment: "56px" },
      { height: "3.5rem", comment: "56px" },
    ],
  },
};
