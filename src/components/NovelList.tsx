import { useLibrarySettings } from '@hooks/persisted';
import { DisplayModes } from '@screens/library/constants/constants';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import { NovelItem, SourceNovel } from '@plugins/types';
import { LibraryNovelInfo, NovelInfo } from '../database/types';
import { useDeviceOrientation } from '@hooks';

export type NovelListRenderItem = ListRenderItem<
  LibraryNovelInfo | NovelInfo | NovelItem
>;

interface NovelListProps
  extends FlatListProps<LibraryNovelInfo | NovelInfo | SourceNovel> {
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

  var extendedNovelList: Array<SourceNovel | LibraryNovelInfo> =
    props?.data as Array<LibraryNovelInfo>;
  if (props.data?.length && props.inSource) {
    let remainder = numColumns - (props.data?.length % numColumns);
    let extension = [];
    if (remainder !== 0 && remainder !== numColumns) {
      extension.push({ sourceId: -remainder, novelName: '', novelUrl: '' });
    }
    //@ts-ignore
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
      keyExtractor={(item, index) => index + '_' + item.path}
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
