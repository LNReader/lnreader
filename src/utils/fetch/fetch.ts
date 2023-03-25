import { getSourceStorage } from '@hooks/useSourceStorage';

export const defaultUserAgentString =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36';

interface FetchParams {
  url: string;
  init?: RequestInit;
  sourceId?: number;
}

export const fetchApi = async ({
  url,
  init,
  sourceId,
}: FetchParams): Promise<Response> => {
  const headers = new Headers({
    ...init?.headers,
    'User-Agent': defaultUserAgentString,
  });

  if (sourceId) {
    const { cookies = '' } = getSourceStorage(sourceId);

    if (cookies) {
      headers.append('cookie', cookies);
    }
  }

  return fetch(url, { ...init, headers });
};

export const fetchHtml = async (params: FetchParams): Promise<string> => {
  const res = await fetchApi(params);
  const html = await res.text();

  if (html.includes('Checking if the site connection is secure')) {
    throw Error(
      "The app couldn't bypass the source's Cloudflare protection.\n\nOpen the source in WebView to bypass the Cloudflare protection.",
    );
  }

  return html;
};
