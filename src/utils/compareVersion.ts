export const smaller = (a: string, b: string): boolean => {
  a = a.replace(/[^\d.]/g, '');
  b = b.replace(/[^\d.]/g, '');
  const arrA = a.split('.').map(value => Number(value));
  const arrB = b.split('.').map(value => Number(value));
  try {
    for (let i = 0; i < Math.max(arrA.length, arrB.length); i++) {
      if (arrA[i] < arrB[i]) {
        return true;
      }
    }
  } catch (e: any) {
    return arrA.length < arrB.length;
  }
  return false;
};

export const equal = (a: string, b: string): boolean => {
  a = a.replace(/[^\d.]/g, '');
  b = b.replace(/[^\d.]/g, '');
  const arrA = a.split('.').map(value => Number(value));
  const arrB = b.split('.').map(value => Number(value));
  if (arrA.length !== arrB.length) {
    return false;
  }
  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }
  return true;
};

export const bigger = (a: string, b: string): boolean =>
  !smaller(a, b) && !equal(a, b);
