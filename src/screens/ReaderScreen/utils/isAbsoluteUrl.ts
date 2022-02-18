export const isAbsoluteUrl = (url: string): boolean => {
  var regex = /^https?:\/\//i;

  return regex.test(url);
};
