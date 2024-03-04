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
    const allCookies = await this.get(url);
    allCookies.forEach(cookie => {
      if (cookie.key === cookieName) {
        cookie.expires = new Date(0).toISOString(); // Expire the cookie to delete it
        await this.set(url, cookie as CookieObject);
      }
    });
  }

  async clearAll(url: string): Promise<void> {
    const allCookies = await this.get(url);
    allCookies.forEach(cookie => {
      cookie.expires = new Date(0).toISOString(); // Expire each cookie to delete it
      await this.set(url, cookie as CookieObject);
    });
  }
}

export const cookieManager = new CookieManager();
