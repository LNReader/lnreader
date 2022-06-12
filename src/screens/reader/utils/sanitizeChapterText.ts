import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: { 'img': ['src'], 'a': ['href'] },
    allowedSchemes: ['data', 'http', 'https'],
  });

  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }
  } else {
    text = "Chapter not available .\n\nReport if it's available in webview.";
  }

  return text;
};
