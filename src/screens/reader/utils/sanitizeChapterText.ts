import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
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
      'img': ['src'],
      'a': ['href'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  });
  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }
    const imgHandlerRegex = /<img([^>]*src="[^"]+"[^>]*)>/g;
    text = text.replace(
      imgHandlerRegex,
      "<img alt=\"Plugin can't fetch this img\" onload=\"reader.refresh()\" onerror=\"this.setAttribute('error-src', this.src);reader.post({type:'error-img',data:this.src});this.src='file:///android_asset/images/loading.gif';this.onerror=undefined\" $1>",
    );
  } else {
    text = getString('readerScreen.emptyChapterMessage');
  }
  return text;
};
