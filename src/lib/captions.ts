/** "nemo-at_the beach.jpg" → "Nemo at the beach". Camera names like IMG_1234 → null. */
export function captionFromFileName(fileName: string): string | null {
  const base = fileName.replace(/\.[^.]+$/, '');
  if (/^(img|dsc|pxl|photo|image|screenshot)?[\s_-]*\d[\d\s_-]*$/i.test(base)) return null;
  const words = base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!/[a-z]/i.test(words)) return null;
  return words.charAt(0).toUpperCase() + words.slice(1);
}
