import { getUserAgent } from '@hooks/persisted/useUserAgent';

type FetchInit = {
  headers?: Record<string, string> | Headers;
  method?: string;
  body?: FormData | string;
  [x: string]: string | Record<string, string> | undefined | FormData | Headers;
};

const makeInit = (init?: FetchInit) => {
  const defaultHeaders = {
    'User-Agent': getUserAgent(),
  };
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      if (!init.headers.get('User-Agent') && defaultHeaders['User-Agent']) {
        init.headers.set('User-Agent', defaultHeaders['User-Agent']);
      }
    } else {
      init.headers = {
        ...defaultHeaders,
        ...init.headers,
      };
    }
  } else {
    init = {
      ...init,
      headers: defaultHeaders,
    };
  }
  return init;
};

export const fetchApi = async (
  url: string,
  init?: FetchInit,
): Promise<Response> => {
  init = makeInit(init);
  return await fetch(url, init);
};

const FILE_READER_PREFIX_LENGTH = 'data:application/octet-stream;base64,'
  .length;

/**
 *
 * @param url
 * @param init
 * @returns base64 of file
 */
export const fetchFile = async (
  url: string,
  init?: FetchInit,
): Promise<string> => {
  init = makeInit(init);
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error();
    }
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onloadend = () => {
        resolve(fr.result.slice(FILE_READER_PREFIX_LENGTH) as string);
      };
      fr.onerror = () => reject();
      fr.onabort = () => reject();
      fr.readAsDataURL(blob);
    });
  } catch (e) {
    return '';
  }
};

/**
 *
 * @param url
 * @param init
 * @param encoding link: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/encoding
 * @returns plain text
 */
export const fetchText = async (
  url: string,
  init?: FetchInit,
  encoding?: string,
): Promise<string> => {
  init = makeInit(init);
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error();
    }
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onloadend = () => {
        resolve(fr.result as string);
      };
      fr.onerror = () => reject();
      fr.onabort = () => reject();
      fr.readAsText(blob, encoding);
    });
  } catch (e) {
    return '';
  }
};
