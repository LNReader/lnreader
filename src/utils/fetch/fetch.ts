import { getSourceStorage } from '@hooks/useSourceStorage';

export const defaultUserAgentString =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36';

interface FetchParams {
  url: string;
  init?: RequestInit;
  sourceId?: number;
  userAgent?: string;
  raw?: Boolean;
}

export const fetchApi = async ({
  url,
  init,
  sourceId,
  userAgent,
}: FetchParams): Promise<Response> => {
  let headers: Headers;
  if (!userAgent) {
    userAgent = defaultUserAgentString;
  }
  if (userAgent === 'false') {
    headers = new Headers({
      ...init?.headers,
    });
  } else {
    headers = new Headers({
      ...init?.headers,
      'User-Agent': userAgent,
    });
  }

  if (sourceId) {
    const { cookies = '' } = getSourceStorage(sourceId);

    if (cookies) {
      headers.append('cookie', cookies);
    }
  }

  return fetch(url, { ...init, headers });
};

export const fetchHtml = async (
  params: FetchParams,
): Promise<string | Array<any>> => {
  const res = await fetchApi(params);
  const html = await res.text();

  if (
    html.includes('Enable JavaScript and cookies to continue') ||
    html.includes('Checking if the site connection is secure')
  ) {
    throw Error(
      "The app couldn't bypass the source's Cloudflare protection.\n\nOpen the source in WebView to bypass the Cloudflare protection.",
    );
  }

  if (params.raw === true) {
    return [res, html];
  } else {
    return html;
  }
};
