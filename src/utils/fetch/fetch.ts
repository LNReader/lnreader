export const defaultUserAgentString =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36';

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
    'User-Agent': defaultUserAgentString,
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

export const fetchFile = async (url: string, init: any) => {
  if (!init) {
    init = {};
  }
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error();
    }
    const blob = await res.blob();
    return new Promise(resolve => {
      const fr = new FileReader();
      fr.onloadend = () => {
        if (
          !fr.result
            .toString()
            .startsWith('data:application/octet-stream;base64,')
        ) {
          return undefined;
        }
        resolve(
          fr.result
            .toString()
            .substring('data:application/octet-stream;base64,'.length),
        );
      };
      fr.readAsDataURL(blob);
    });
  } catch (e) {
    return undefined;
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
