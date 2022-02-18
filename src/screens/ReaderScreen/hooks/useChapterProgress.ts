import {useState} from 'react';

import {useAppDispatch, useSavedChapterData} from '../../../redux/hooks';
import {saveChapterProgress} from '../../../redux/localStorage/localStorageSlice';

export const useChapterProgress = (chapterId: number, readerRef: any) => {
  const dispatch = useAppDispatch();
  const {progressPercentage = 0, progressLocation = 0} =
    useSavedChapterData(chapterId) || {};

  const [percentage, setPercentage] = useState(progressPercentage);
  const [location, setLocation] = useState(progressLocation);

  const setProgress = ({nativeEvent}: {nativeEvent: any}) => {
    const currentOffsetY = nativeEvent.contentOffset.y;
    const currentPosition =
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

    const currentProgressPercentage = Math.round(
      (currentPosition / nativeEvent.contentSize.height) * 100,
    );

    setPercentage(currentProgressPercentage);
    setLocation(currentOffsetY);

    dispatch(
      saveChapterProgress({
        chapterId,
        progressLocation: currentOffsetY,
        progressPercentage: currentProgressPercentage,
      }),
    );
  };

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
