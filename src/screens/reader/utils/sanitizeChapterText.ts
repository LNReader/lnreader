import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  const allowedStyles: { [key: string]: string[] } = {
    'game-prompt-gold-info': ['font-family', 'text-align'],
    'game-prompt-gold-info-title': ['font-family', 'text-align'],
    'game-prompt-gold-info-content': ['font-family', 'text-align'],
    'game-prompt-info': ['font-family', 'text-align'],
    'game-prompt-info-title': ['font-family', 'text-align'],
    'game-prompt-info-content': ['font-family', 'text-align'],
    'game-prompt-info-small': ['font-family', 'text-align'],
    'game-prompt-info-small-content': ['font-family', 'text-align'],
    'game-prompt-silver-info': ['font-family', 'text-align'],
    'game-prompt-silver-info-content': ['font-family', 'text-align'],
    'game-prompt-warning': ['font-family', 'text-align'],
    'game-prompt-warning-title': ['font-family', 'text-align'],
    'game-prompt-warning-content': ['font-family', 'text-align'],
    'novel-system-box': ['font-family', 'text-align'],
    'letter-style': ['font-family', 'text-align'],
    'system': ['font-family', 'text-align'],
  };
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'a',
      'b',
      'div',
      'em',
      'i',
      'img',
      'li',
      'ol',
    ]),
    allowedAttributes: {
      'a': ['href', 'class', 'id'],
      'div': ['class', 'id', 'style'],
      'img': ['src', 'class', 'id'],
      'ol': ['reversed', 'start', 'type'],
      'p': ['class', 'id'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
    transformTags: {
      'div': (tagName, attribs) => {
        if (attribs.class) {
          const classes = attribs.class.split(' ');
          for (const cls of classes) {
            if (allowedStyles[cls]) {
              const styles = attribs.style ? attribs.style.split(';') : [];
              const allowedStylesForClass = styles.filter(style => {
                const [property] = style.split(':');
                return allowedStyles[cls].includes(property.trim());
              });
              return {
                tagName: tagName,
                attribs: {
                  ...attribs,
                  style: allowedStylesForClass.join(';'),
                },
              };
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { style, ...rest } = attribs;
        return {
          tagName: tagName,
          attribs: rest,
        };
      },
    },
  });
  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }
  } else {
    text = getString('readerScreen.emptyChapterMessage');
  }
  return text;
};
