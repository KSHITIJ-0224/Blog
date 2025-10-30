export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // average reading speed
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute)); // at least 1 minute
}

export function getWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}
