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
