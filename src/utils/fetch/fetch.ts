import { getSourceStorage } from '@hooks/useSourceStorage';

export const defaultUserAgentString =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36';

interface FetchParams {
  url: string; // URL of request
  init?: RequestInit; // Variable for passing headers and other information
  sourceId?: number; // ID number of source for cookies
  raw?: Boolean; // for fetchHtml, allows returning array with response and html.
}

export const fetchApi = async ({
  url,
  init,
  sourceId,
}: FetchParams): Promise<Response> => {
  let headers = new Headers({
    'User-Agent': defaultUserAgentString,
    ...init?.headers,
  });
  // 'User-Agent' can be overwritten by defining
  // init: { headers: { 'User-Agent': 'New user agent!' } },
  // You can have NO user agent by doing this:
  // init: { headers: { 'User-Agent': undefined } },

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
