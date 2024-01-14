export const defaultUserAgentString =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36';

interface FetchParams {
  url: string; // URL of request
  init?: RequestInit; // Variable for passing headers and other information
}

// Checks if we bypassed cloudflare. If we failed to bypass, throw error.
export const cloudflareCheck = (text: string) => {
  if (text.length > 0) {
    if (
      text.includes('Enable JavaScript and cookies to continue') ||
      text.includes('Checking if the site connection is secure') ||
      text.includes('Verify below to continue reading')
    ) {
      throw Error(
        "The app couldn't bypass the source's Cloudflare protection.\n\nOpen the source in WebView and complete the verification to bypass the Cloudflare protection.",
      );
    }
  }
};

export const fetchApi = async ({
  url,
  init,
}: FetchParams): Promise<Response> => {
  let headers = new Headers({
    'User-Agent': defaultUserAgentString,
    ...init?.headers,
  });
  // 'User-Agent' can be overwritten by defining
  // init: { headers: { 'User-Agent': 'New user agent!' } },
  // You can have NO user agent by doing this:
  // init: { headers: { 'User-Agent': undefined } },

  return fetch(url, { ...init, headers });
};

export const fetchHtml = async (params: FetchParams): Promise<string> => {
  const res = await fetchApi(params);
  const html = await res.text();

  cloudflareCheck(html);

  return html;
};
