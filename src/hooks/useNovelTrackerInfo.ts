import { useAppSelector } from '../redux/hooks';

const useNovelTrackerInfo = (novelId: number) => {
  const tracker = useAppSelector(state => state.trackerReducer) as any;

  const isTracked = tracker.trackedNovels.find(
    (novel: any) => novel.novelId === novelId,
  );

  return { isTracked, isTrackerAvailable: tracker };
};

export default useNovelTrackerInfo;
