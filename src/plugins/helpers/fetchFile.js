import { showToast } from '@hooks/showToast';

const fetchFile = async (url, init) => {
  if (!init) {
    init = {};
  }
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error();
    }
    const blob = await res.blob();
    return new Promise(resolve => {
      const fr = new FileReader();
      fr.onloadend = () => {
        if (!fr.result.startsWith('data:application/octet-stream;base64,')) {
          return undefined;
        }
        resolve(
          fr.result.substring('data:application/octet-stream;base64,'.length),
        );
      };
      fr.readAsDataURL(blob);
    });
  } catch (e) {
    showToast('Error when fetching images');
    return undefined;
  }
};

export { fetchFile };
