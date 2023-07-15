import React, { Ref, useCallback } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { overlay } from 'react-native-paper';

interface BottomSheetProps extends Omit<BottomSheetModalProps, 'ref'> {
  bottomSheetRef: Ref<BottomSheetModal> | null;
}

const BottomSheet: React.FC<BottomSheetProps> = props => {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={props.bottomSheetRef}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      containerStyle={{ paddingBottom: bottom }}
      backgroundStyle={{ backgroundColor: overlay(2, theme.surface) }}
      {...props}
    >
      {props.children}
    </BottomSheetModal>
  );
};

export default BottomSheet;
