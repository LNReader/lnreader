import { defaultUserAgentString, fetchApi } from '@utils/fetch/fetch';
import { Cheerio, CheerioAPI, Element } from 'cheerio';

export const bypassImages = async (
  loadedCheerio: CheerioAPI,
  element: Cheerio<Element>,
): Promise<string> => {
  let promises: Promise<number>[] = [];

  element.find('noscript').each(function () {
    loadedCheerio(this).remove();
  });

  element.find('img').each(function () {
    const attr: any = this.attributes.find(
      a => a.name.includes('src') && !a.value.includes(', '),
    );

    if (!attr) {
      loadedCheerio(this).remove();
      return;
    }

    const promise: Promise<number> = new Promise(async r => {
      const response = await fetchApi({
        url: attr.value,
        init: {
          headers: { 'User-Agent': defaultUserAgentString },
        },
      });

      const blob = await response.blob();
      const encodedImage: string = await new Promise((onSuccess, onError) => {
        try {
          const reader = new FileReader();
          reader.onload = function () {
            onSuccess(this.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          onError(e);
        }
      });

      loadedCheerio(this).replaceWith(`<img src="${encodedImage}"/>`);
      r(0);
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  return element.html()!!;
};
