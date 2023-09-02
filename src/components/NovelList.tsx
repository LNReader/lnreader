import { useLibrarySettings } from '@hooks/useSettings';
import { DisplayModes } from '@screens/library/constants/constants';
import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import { SourceNovelItem } from '../sources/types';
import { LibraryNovelInfo, NovelInfo } from '../database/types';
import { useDeviceOrientation } from '@hooks/useDeviceOrientation';

export type NovelListRenderItem = ListRenderItem<
  LibraryNovelInfo | NovelInfo | SourceNovelItem
>;

interface NovelListProps
  extends FlatListProps<LibraryNovelInfo | NovelInfo | SourceNovelItem> {
  isFetchingNextPage?: boolean;
  inSource?: boolean;
}

const NovelList: React.FC<NovelListProps> = props => {
  const { displayMode = DisplayModes.Comfortable, novelsPerRow = 3 } =
    useLibrarySettings();

  const orientation = useDeviceOrientation();

  const isListView = displayMode === DisplayModes.List;

  const numColumns = useMemo(() => {
    if (isListView) {
      return 1;
    }

    if (orientation === 'landscape') {
      return 6;
    } else {
      return novelsPerRow;
    }
  }, [isListView, orientation, novelsPerRow]);

  const keyExtractor = useCallback(
    (item: SourceNovelItem) => item.sourceId + item.novelUrl,
    [],
  );
  var extendedNovelList: Array<SourceNovelItem | LibraryNovelInfo> =
    props?.data as Array<LibraryNovelInfo>;
  if (props.data?.length && props.inSource && props.isFetchingNextPage) {
    let remainder = numColumns - (props.data?.length % numColumns);
    let extension = [];
    if (remainder !== 0 && remainder !== numColumns) {
      extension.push({ sourceId: -remainder, novelName: '', novelUrl: '' });
    }
    extendedNovelList = [...props.data, ...extension];
  }

  return (
    <FlatList
      contentContainerStyle={[
        !isListView && styles.listView,
        styles.flatListCont,
      ]}
      numColumns={numColumns}
      key={numColumns}
      keyExtractor={keyExtractor}
      {...props}
      data={extendedNovelList}
    />
  );
};

export default NovelList;

const styles = StyleSheet.create({
  flatListCont: {
    flexGrow: 1,
    paddingBottom: 56,
  },
  listView: {
    paddingHorizontal: 4,
  },
});
