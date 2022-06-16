export const bytes = (s: string) => {
  return ~-encodeURI(s).split(/%..|./).length;
};
