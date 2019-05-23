export function asToken(text) {
  return new RegExp(`^(.*\\s+)*${text}(\\s+.*)*$`, 'i');
}
