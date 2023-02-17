import { useWindowDimensions } from 'react-native';

export const useDeviceOrientation = () => {
  const window = useWindowDimensions();

  if (window.width > window.height) {
    return 'landscape';
  } else {
    return 'potrait';
  }
};
