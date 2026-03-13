export const mergeStyles = (styles: Record<string, string>[]): Record<string, string> =>
  styles.reduce((reduced, style) => ({ ...reduced, ...style }), {});
