export function formatDate(dateStr) {
  if (!dateStr) return "-";

  const clean = dateStr.split("T")[0];
  const [y, m, d] = clean.split("-");

  return `${d}/${m}/${y}`;
}
