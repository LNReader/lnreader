import { getSourceStorage } from '@hooks/useSourceStorage';

export const defaultUserAgentString =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36';

export const fetchApi = async (
  url: string,
  init?: any,
  pluginId?: string,
): Promise<Response> => {
  const headers = new Headers({
    ...init?.headers,
    'User-Agent': defaultUserAgentString,
  });

  if (pluginId) {
    const { cookies = '' } = getSourceStorage(pluginId);

    if (cookies) {
      headers.append('cookie', cookies);
    }
  }
  return await fetch(url, { ...init, headers });
};
