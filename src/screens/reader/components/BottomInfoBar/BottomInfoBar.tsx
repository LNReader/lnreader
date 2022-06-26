import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useBatteryLevel } from 'react-native-device-info';
import moment from 'moment';

import { useReaderSettings, useSettingsV1 } from '@redux/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomInfoBarProps {
  scrollPercentage: number;
}

const BottomInfoBar: React.FC<BottomInfoBarProps> = ({ scrollPercentage }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const {
    showScrollPercentage = true,
    showBatteryAndTime = false,
    fullScreenMode = true,
  } = useSettingsV1();

  const { textColor, theme: backgroundColor } = useReaderSettings();

  const batteryLevel = useBatteryLevel();

  const [currentTime, setCurrentTime] = useState<string>();

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  if (showScrollPercentage || showBatteryAndTime) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor },
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
        {showScrollPercentage ? (
          <Text style={[styles.scrollPercentage, { color: textColor }]}>
            {scrollPercentage + '%'}
          </Text>
        ) : null}
        {showBatteryAndTime ? (
          <Text style={{ color: textColor }}>
            {moment(currentTime).format('LT')}
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
  scrollPercentage: {
    flex: 1,
    textAlign: 'center',
  },
});
