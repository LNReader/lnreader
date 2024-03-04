import CookieStore from '@react-native-cookies/cookies';

interface CookieObject {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  version?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
}

class CookieManager {
  get = CookieStore.get;
  set = CookieStore.set;
  setFromResponse = CookieStore.setFromResponse;

  async delete(url: string, cookieName: string): Promise<void> {
    /*
    taken from the discussion
    https://github.com/react-native-cookies/cookies/issues/100#issuecomment-1525881404
    */
    await this.set(url, {
      name: cookieName,
      value: '', //To delete cookies, you need to set the value to an empty string
      expires: new Date(0).toISOString(), //or specify a past date in expires
    });
  }

  async clearAll(url: string): Promise<void> {
    const allCookies = await this.get(url);
    for (const cookie of allCookies) {
      cookie.value = '';
      cookie.expires = new Date(0).toISOString(); //expire each cookie to delete it
      await this.set(url, cookie as CookieObject);
    }
  }
}

export const cookieManager = new CookieManager();
