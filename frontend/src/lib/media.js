const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

export const resolveMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path}`;
};
