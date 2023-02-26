import sanitizeHtml from 'sanitize-html';

import { load as loadCheerio } from 'cheerio';
import { sourceManager } from './../../../sources/sourceManager';
import { LoadingImageSrc } from './LoadImage';

interface Options {
  removeExtraParagraphSpacing?: boolean;
  sourceId?: number;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'input']),
    allowedAttributes: {
      'img': ['src', 'type', 'file-path', 'file-id', 'offline', 'class'],
      'a': ['href'],
      'input': ['type', 'offline'],
    },
    allowedSchemes: ['data', 'http', 'https'],
  });

  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }
    const loadedCheerio = loadCheerio(text);
    if (
      options?.sourceId &&
      sourceManager(options.sourceId).headers &&
      loadedCheerio('input[offline]').length === 0
    ) {
      loadedCheerio('img').each((i, element) => {
        const src = loadedCheerio(element).attr('src');
        if (src) {
          loadedCheerio(element).attr({
            'src': LoadingImageSrc,
            'class': 'load-icon',
            'delayed-src': src,
          });
        }
      });
      text = loadedCheerio('body').html() || text;
    }
  } else {
    text =
      "Chapter is empty.\n\nReport on <a href='https://github.com/LNReader/lnreader-sources/issues/new/choose'>github</a> if it's available in webview.";
  }

  return text;
};
