import React, { RefObject, useCallback, useRef } from 'react';
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
  const indexRef = useRef<number>();
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
    if (typeof indexRef.current === 'number' && indexRef.current !== -1) {
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
        indexRef.current = index;
      }}
      {...otherProps}
    >
      {children}
    </BottomSheetModal>
  );
};

export default BottomSheet;
