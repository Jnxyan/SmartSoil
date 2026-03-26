function soilColor(v, lo, hi) {
  if (v < lo) return "bad";
  if (v > hi) return "warn";
  return "good";
}

export default soilColor;