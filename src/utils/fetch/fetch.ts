import { getUserAgent } from '@hooks/persisted/useUserAgent';

export const fetchApi = async (
  url: string,
  init?: {
    headers?: Record<string, string> | Headers;
    [x: string]:
      | string
      | Record<string, string>
      | undefined
      | FormData
      | Headers;
  },
): Promise<Response> => {
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
  return await fetch(url, init);
};

const FILE_READER_PREFIX_LENGTH = 'data:application/octet-stream;base64,'
  .length;

export const fetchFile = async (url: string, init: any): Promise<string> => {
  if (!init) {
    init = {};
  }
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

export const fetchTimeout = async (
  url: string,
  init?: any,
  timeout: number = 5000,
) => {
  const constroller = new AbortController();
  setTimeout(() => constroller.abort(), timeout);
  return fetch(url, {
    ...init,
    signal: constroller.signal,
  });
};
