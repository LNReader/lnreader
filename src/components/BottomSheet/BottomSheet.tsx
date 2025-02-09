import React, { RefObject, useCallback, useRef } from 'react';
import {
  // BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBackHandler } from '@hooks/index';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import BottomSheetBackdrop from './BottomSheetBackdrop';

interface BottomSheetProps
  extends Omit<BottomSheetModalProps, 'ref' | 'onChange'> {
  bottomSheetRef: RefObject<BottomSheetModalMethods> | null;
  onChange?: (index: number) => void;
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
      <BottomSheetBackdrop {...backdropProps} />
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
      enableDynamicSizing={false}
      {...otherProps}
    >
      {children}
    </BottomSheetModal>
  );
};

export default React.memo(BottomSheet);
