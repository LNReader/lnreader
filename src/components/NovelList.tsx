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

const NovelList: React.FC<
  FlatListProps<LibraryNovelInfo | NovelInfo | SourceNovelItem>
> = props => {
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

  const keyExtractor = useCallback(item => item.sourceId + item.novelUrl, []);

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
