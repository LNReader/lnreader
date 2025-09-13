import React, { RefObject, useCallback, useMemo, useRef } from 'react';
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
import { useWindowDimensions } from 'react-native';
import { useTheme } from '@hooks/persisted';
import { overlay } from 'react-native-paper';

interface BottomSheetProps
  extends Omit<BottomSheetModalProps, 'ref' | 'onChange' | 'snapPoints'> {
  bottomSheetRef: RefObject<BottomSheetModalMethods | null>;
  onChange?: (index: number) => void;
  snapPoints?: number[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  bottomSheetRef,
  children,
  onChange,
  containerStyle,
  snapPoints,
  ...otherProps
}) => {
  const indexRef = useRef<number>(null);
  const { bottom, top } = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const theme = useTheme();

  const backgroundColor = overlay(2, theme.surface);

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

  const safeSnapPoints = useMemo(() => {
    if (!snapPoints) {
      return undefined;
    }
    const maxHeight = height - top;
    return snapPoints
      .sort((a, b) => a - b)
      .map(point => {
        if (point < maxHeight - 100) return point;
        return maxHeight;
      });
  }, [height, snapPoints, top]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor }}
      handleComponent={null}
      containerStyle={[{ paddingBottom: bottom }, containerStyle]}
      onChange={index => {
        onChange?.(index);
        indexRef.current = index;
      }}
      enableDynamicSizing={false}
      enableOverDrag={false}
      snapPoints={safeSnapPoints}
      {...otherProps}
    >
      {children}
    </BottomSheetModal>
  );
};

export default React.memo(BottomSheet);
