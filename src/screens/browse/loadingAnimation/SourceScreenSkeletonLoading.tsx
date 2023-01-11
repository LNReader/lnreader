import React, { memo, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { MD3ThemeType } from '@theme/types';
import getLoadingColors from '@utils/getLoadingColors';
import LoadingNovel from '@screens/browse/loadingAnimation/LoadingNovel';
import { useLibrarySettings } from '@hooks/useSettings';
import { useDeviceOrientation } from '../../../services/utils/helpers';
import { DisplayModes } from '@screens/library/constants/constants';

interface Props {
  theme: MD3ThemeType;
}

const SourceScreenSkeletonLoading: React.FC<Props> = ({ theme }) => {
  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const { displayMode = DisplayModes.Comfortable, novelsPerRow = 3 } =
    useLibrarySettings();

  const window = useWindowDimensions();
  const styles = createStyleSheet();

  const orientation = useDeviceOrientation();

  const numColumns = useMemo(
    () => (orientation === 'landscape' ? 6 : novelsPerRow),
    [orientation, novelsPerRow],
  );

  const [pictureHeight, pictureWidth] = useMemo(() => {
    let height = (window.width / numColumns) * (4 / 3);
    let width = (window.width - 12 - 9.6 * numColumns) / numColumns;
    return [height, width];
  }, [numColumns]);

  const renderLoadingNovel = (item: number, index: number) => {
    let randomNumber = Math.random();
    randomNumber < 0.1 ? (randomNumber = 0) : null;
    return (
      <LoadingNovel
        key={index}
        backgroundColor={backgroundColor}
        highlightColor={highlightColor}
        pictureHeight={pictureHeight}
        pictureWidth={pictureWidth}
        displayMode={displayMode}
      />
    );
  };
  const renderLoading = (item: number, index: number) => {
    const offset = Math.pow(10, item);
    const items: Array<number> = [1 * offset];
    if (displayMode !== DisplayModes.List) {
      for (let i = 2; i <= numColumns; i++) {
        items.push(i * offset);
      }
    }
    return (
      <View key={index} style={styles.row}>
        {items.map(renderLoadingNovel)}
      </View>
    );
  };
  let items: Array<number> = [];
  if (displayMode === DisplayModes.List) {
    items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  } else {
    for (let i = 1; i * pictureHeight < window.height - 100; i++) {
      items.push(i);
    }
  }
  return <View style={styles.container}>{items.map(renderLoading)}</View>;
};

const createStyleSheet = () => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      marginHorizontal: 4,
      marginBottom: 8,
      marginTop: 2,
      overflow: 'visible',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 1,
    },
  });
};

export default memo(SourceScreenSkeletonLoading);
