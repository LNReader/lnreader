import React from 'react';
import { FlatList, FlatListProps, StyleSheet } from 'react-native';

import { useAppearanceSettings } from '../../redux/hooks';
import { useDeviceOrientation } from '../../hooks';

import { LibraryNovelInfo, NovelInfo } from '../../database/types';
import { SourceNovelItem } from '../../sources/types';
import { DeviceOrientation } from '../../hooks/useDeviceOrientation';

const NovelList: React.FC<
  FlatListProps<SourceNovelItem | NovelInfo | LibraryNovelInfo>
> = props => {
  const orientation = useDeviceOrientation();

  const { novelsPerRowPotrait, novelsPerRowLandscape } =
    useAppearanceSettings();

  return (
    <FlatList
      contentContainerStyle={styles.container}
      numColumns={
        orientation === DeviceOrientation.LANDSCAPE
          ? novelsPerRowLandscape
          : novelsPerRowPotrait
      }
      key={[orientation, novelsPerRowPotrait] as any}
      {...props}
    />
  );
};

export default NovelList;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 4,
  },
});
