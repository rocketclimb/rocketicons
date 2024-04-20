export const templateBuilder = (template: string, ...params: string[]) =>
  params.reduce(
    (parsed, param, i) => parsed.replace(RegExp(`\\{${i}\\}`, "g"), param),
    template
  );
