import { defaultCover } from '@plugins/helpers/constants';

/**
 * Normalize a cover string to a valid image URI for React Native Image components.
 * - If already a URI (file://, http(s), data:image), return as-is.
 * - If it's a base64 string, prefix with data:image/png;base64,
 * - If falsy, return defaultCover placeholder.
 */
export function toImageUri(cover?: string | null): string {
  if (!cover) return defaultCover;
  const str = String(cover);
  if (
    str.startsWith('data:image') ||
    str.startsWith('file://') ||
    str.startsWith('http://') ||
    str.startsWith('https://')
  ) {
    return str;
  }
  return `data:image/png;base64,${str}`;
}
