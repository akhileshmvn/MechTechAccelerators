export const hasNameWarning = (value: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /_{2,}|\s/.test(trimmed);
};

export const normalizeName = (value: string) => {
  if (!value) return "";
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};
