import sanitizeHtml from 'sanitize-html';
import { load as loadCheerio } from 'cheerio';

interface Options {
  removeExtraParagraphSpacing?: boolean;
  pluginId?: string;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  if (html) {
    html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'i',
      'em',
      'b',
      'a',
      'div',
    ]),
    allowedAttributes: {
      'img': ['src', 'class', 'error-src'],
      'a': ['href'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  });
  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }
    const loadedCheerio = loadCheerio(text);
    loadedCheerio('img').each((i, img) => {
      loadedCheerio(img).attr({
        onload: 'reader.refresh()',
        onerror:
          "this.setAttribute('error-src', this.src);reader.post({type:'error-img',data:this.src});this.src='file:///android_asset/images/loading.gif';",
      });
    });
    text = loadedCheerio('body').html() || text;
  } else {
    text =
      "Chapter is empty.\n\nReport on <a href='https://github.com/LNReader/lnreader-sources/issues/new/choose'>github</a> if it's available in webview.";
  }
  return text;
};
