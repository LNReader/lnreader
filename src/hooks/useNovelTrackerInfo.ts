import { useAppSelector } from '../redux/hooks';

const useNovelTrackerInfo = (novelId: number) => {
  const { trackedNovels } = useAppSelector(state => state.trackerReducer);

  const isTracked = trackedNovels.find(
    (novel: any) => novel.novelId === novelId,
  );

  return { isTracked };
};

export default useNovelTrackerInfo;
