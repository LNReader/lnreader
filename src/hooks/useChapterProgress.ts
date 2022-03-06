import { useEffect, useRef, useState } from 'react';

import { useAppDispatch, useSavedChapterData } from '../redux/hooks';
import { saveChapterProgress } from '../redux/localStorage/localStorageSlice';

export const useChapterProgress = (chapterId: number, readerRef: any) => {
  const dispatch = useAppDispatch();
  const { progressPercentage = 0, progressLocation = 0 } =
    useSavedChapterData(chapterId);

  const [percentage, setPercentage] = useState(progressPercentage);
  const [location, setLocation] = useState(progressLocation);

  const percentageRef = useRef(0);
  percentageRef.current = percentage;

  const locationRef = useRef(0);
  locationRef.current = location;

  const setProgress = ({ nativeEvent }: { nativeEvent: any }) => {
    const currentOffsetY = nativeEvent.contentOffset.y;
    const currentPosition =
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

    const currentProgressPercentage = Math.round(
      (currentPosition / nativeEvent.contentSize.height) * 100,
    );

    setPercentage(currentProgressPercentage);
    setLocation(currentOffsetY);
  };

  useEffect(() => {
    return () => {
      dispatch(
        saveChapterProgress({
          chapterId,
          progressLocation: locationRef.current,
          progressPercentage: percentageRef.current,
        }),
      );
    };
  }, []);

  const [firstLayout, setFirstLayout] = useState(true);

  const scrollToSavedProgress = () => {
    if (firstLayout) {
      percentage < 100 &&
        readerRef.current.scrollTo({
          x: 0,
          y: location,
          animated: false,
        });
      setFirstLayout(false);
    }
  };

  return {
    progressLocation,
    progressPercentage: percentage,
    setProgress,
    scrollToSavedProgress,
  };
};
