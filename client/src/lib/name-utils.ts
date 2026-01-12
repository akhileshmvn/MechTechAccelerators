export const hasNameWarning = (value: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /_{2,}|[^A-Za-z0-9_]/.test(trimmed);
};

export const normalizeName = (value: string) => {
  if (!value) return "";
  return value
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};
