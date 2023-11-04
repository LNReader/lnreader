export const defaultUserAgentString =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';

export const fetchApi = async (url: string, init?: any): Promise<Response> => {
  const headers = new Headers({
    'User-Agent': defaultUserAgentString,
    ...init?.headers,
  });
  return await fetch(url, { ...init, headers });
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
