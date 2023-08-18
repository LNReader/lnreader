import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useBatteryLevel } from 'react-native-device-info';
import dayjs from 'dayjs';

import { useReaderSettings, useSettingsV1 } from '@redux/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomInfoBar = () => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { showBatteryAndTime = false, fullScreenMode = true } = useSettingsV1();

  const { textColor } = useReaderSettings();

  const batteryLevel = useBatteryLevel();

  const [currentTime, setCurrentTime] = useState<string>();

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  if (showBatteryAndTime) {
    return (
      <View
        style={[
          styles.container,
          !fullScreenMode && {
            paddingBottom: bottomInset,
          },
        ]}
      >
        {showBatteryAndTime && batteryLevel ? (
          <Text style={{ color: textColor }}>
            {Math.ceil(batteryLevel * 100) + '%'}
          </Text>
        ) : null}
        {showBatteryAndTime ? (
          <Text style={{ color: textColor }}>
            {dayjs(currentTime).format('LT')}
          </Text>
        ) : null}
      </View>
    );
  } else {
    return null;
  }
};

export default BottomInfoBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingVertical: 10,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    flexDirection: 'row',
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
