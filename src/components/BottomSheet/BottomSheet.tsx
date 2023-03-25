import React, { ReactElement, Ref, useCallback } from 'react';
import { overlay } from 'react-native-paper';
import { default as BS, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@theme/types';
import { StyleSheet } from 'react-native';

interface BottomSheetProps {
  bottomSheetRef: Ref<BS>;
  snapPoints: Array<number>;
  height: number;
  theme: ThemeColors;
  children: ReactElement;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  height,
  theme,
  children,
}) => {
  const { bottom } = useSafeAreaInsets();
  const renderBackdrop = useCallback(
    props => <BottomSheetBackdrop {...props} disappearsOnIndex={0} />,
    [],
  );
  return (
    <BS
      index={-1}
      backdropComponent={renderBackdrop}
      snapPoints={[0.1].concat(snapPoints)}
      enablePanDownToClose={true}
      ref={bottomSheetRef}
      handleStyle={styles.handle}
      containerHeight={height + bottom}
      containerStyle={{ paddingBottom: bottom }}
      backgroundStyle={{ backgroundColor: overlay(2, theme.surface) }}
    >
      {children}
    </BS>
  );
};
const styles = StyleSheet.create({
  handle: {
    display: 'none',
  },
});
export default BottomSheet;
