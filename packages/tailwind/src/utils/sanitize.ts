const sanitize = (classes: string): string => classes.trim().replace(/\s{2,}/g, " ");
export default sanitize;
