import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { useDeviceOrientation } from '../hooks';
import { DeviceOrientation } from '../hooks/useDeviceOrientation';
import { useAppearanceSettings } from '../redux/hooks';

const useNovelCoverHeight = () => {
  const window = useWindowDimensions();
  const orientation = useDeviceOrientation();

  const { novelsPerRowLandscape, novelsPerRowPotrait } =
    useAppearanceSettings();

  const [coverHeight, setCoverHeight] = useState<number>();

  const getCoverHeight = useCallback(
    () =>
      (window.width /
        (orientation === DeviceOrientation.POTRAIT
          ? novelsPerRowPotrait
          : novelsPerRowLandscape)) *
      (4 / 3),
    [window.width, novelsPerRowPotrait, novelsPerRowLandscape, orientation],
  );

  useEffect(() => {
    setCoverHeight(getCoverHeight());
  }, [getCoverHeight]);

  return coverHeight;
};

export default useNovelCoverHeight;
