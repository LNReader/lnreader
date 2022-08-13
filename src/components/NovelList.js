import { useLibrarySettings } from '@hooks/useSettings';
import { DisplayModes } from '@screens/library/constants/constants';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';

import { useDeviceOrientation } from '../services/utils/helpers';

const NovelList = ({
  data,
  onScroll,
  onEndReached,
  renderItem,
  refreshControl,
  ListEmptyComponent,
  ListFooterComponent,
}) => {
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
      estimatedItemSize={100}
      contentContainerStyle={[
        !isListView && styles.listView,
        styles.flatListCont,
      ]}
      numColumns={numColumns}
      key={[orientation, numColumns]}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      refreshControl={refreshControl}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      onScroll={onScroll}
      onEndReached={onEndReached}
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
