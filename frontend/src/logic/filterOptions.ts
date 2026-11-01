// Case-insensitive match; names that start with the text come first.
export const filterOptions = <T>(options: T[], query: string, getLabel: (option: T) => string) => {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  const starts: T[] = [];
  const contains: T[] = [];
  for (const option of options) {
    const label = getLabel(option).toLowerCase();
    if (label.startsWith(q)) starts.push(option);
    else if (label.includes(q)) contains.push(option);
  }
  return [...starts, ...contains];
};
