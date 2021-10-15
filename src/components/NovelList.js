import React, {useCallback} from 'react';
import {StyleSheet, FlatList} from 'react-native';

import {useSettings} from '../hooks/reduxHooks';
import {useDeviceOrientation} from '../services/utils/helpers';

const NovelList = ({
  data,
  onScroll,
  onEndReached,
  renderItem,
  refreshControl,
  ListEmptyComponent,
  ListFooterComponent,
}) => {
  const {displayMode, novelsPerRow} = useSettings();

  const orientation = useDeviceOrientation();

  const getNovelsPerRow = () => {
    if (displayMode === 2) {
      return 1;
    }

    if (orientation === 'landscape') {
      return 6;
    } else {
      return novelsPerRow;
    }
  };

  const keyExtractor = useCallback(item => item.novelUrl, []);

  return (
    <FlatList
      contentContainerStyle={[
        styles.flatListCont,
        displayMode !== 2 && {paddingHorizontal: 4},
      ]}
      numColumns={getNovelsPerRow()}
      key={[orientation, getNovelsPerRow()]}
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
});
