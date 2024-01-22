export const older = (a: string, b: string): boolean => {
  a = a.replace(/[^\d.]/g, '');
  b = b.replace(/[^\d.]/g, '');
  const arrA = a.split('.').map(value => Number(value));
  const arrB = b.split('.').map(value => Number(value));
  try {
    for (let i = 0; i < Math.min(arrA.length, arrB.length); i++) {
      if (arrA[i] < arrB[i]) {
        return true;
      }
      if (arrA[i] > arrB[i]) {
        return false;
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

export const newer = (a: string, b: string): boolean =>
  !older(a, b) && !equal(a, b);
