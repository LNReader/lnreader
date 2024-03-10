import { useLibrarySettings } from '@hooks/persisted';
import { DisplayModes } from '@screens/library/constants/constants';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import { NovelItem } from '@plugins/types';
import { LibraryNovelInfo, NovelInfo } from '../database/types';
import { useDeviceOrientation } from '@hooks';

export type NovelListRenderItem = ListRenderItem<
  LibraryNovelInfo | NovelInfo | NovelItem
>;

type listDataItem =
  | (LibraryNovelInfo | NovelInfo | NovelItem) & {
      completeRow?: number;
    };

interface NovelListProps
  extends FlatListProps<LibraryNovelInfo | NovelInfo | NovelItem> {
  inPlugin?: boolean;
  data: Array<listDataItem>;
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

  var extendedNovelList: Array<listDataItem> = props?.data;
  if (props.data?.length && props.inPlugin) {
    let remainder = numColumns - (props.data?.length % numColumns);
    let extension: Array<listDataItem> = [];
    if (remainder !== 0 && remainder !== numColumns) {
      extension.push({
        cover: '',
        name: '',
        path: 'loading-' + remainder,
        completeRow: -remainder,
      } as listDataItem);
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
