import { useWindowDimensions } from 'react-native';

export enum DeviceOrientation {
  POTRAIT = 'potrait',
  LANDSCAPE = 'landscape',
}

const useDeviceOrientation = (): DeviceOrientation => {
  const window = useWindowDimensions();

  if (window.width > window.height) {
    return DeviceOrientation.LANDSCAPE;
  } else {
    return DeviceOrientation.POTRAIT;
  }
};

export default useDeviceOrientation;
