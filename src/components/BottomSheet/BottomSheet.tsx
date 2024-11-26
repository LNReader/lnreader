import React, { RefObject, useCallback, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBackHandler } from '@hooks/index';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

interface BottomSheetProps extends Omit<BottomSheetModalProps, 'ref'> {
  bottomSheetRef: RefObject<BottomSheetModalMethods> | null;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  bottomSheetRef,
  children,
  onChange,
  ...otherProps
}) => {
  const [index, setIndex] = useState(-1);
  const { bottom } = useSafeAreaInsets();
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
  useBackHandler(() => {
    if (index !== -1) {
      bottomSheetRef?.current?.close();
      return true;
    }
    return false;
  });
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      containerStyle={{ paddingBottom: bottom }}
      onChange={index => {
        onChange?.(index);
        setIndex(index);
      }}
      {...otherProps}
    >
      {children}
    </BottomSheetModal>
  );
};

export default BottomSheet;
