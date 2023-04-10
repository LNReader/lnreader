import React from 'react';

import { List, SwitchItem } from '@components/index';

import { useSettingsV1, useAppDispatch } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { setAppSettings } from '@redux/settings/settings.actions';

const DisplaySettings: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {
    fullScreenMode = true,
    showScrollPercentage = true,
    showBatteryAndTime = false,
  } = useSettingsV1();

  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('novelScreen.bottomSheet.display')}
      </List.SubHeader>
      <SwitchItem
        label={getString('readerScreen.bottomSheet.fullscreen')}
        value={fullScreenMode}
        onPress={() =>
          dispatch(setAppSettings('fullScreenMode', !fullScreenMode))
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.showProgressPercentage')}
        value={showScrollPercentage}
        onPress={() =>
          dispatch(
            setAppSettings('showScrollPercentage', !showScrollPercentage),
          )
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.showBatteryAndTime')}
        value={showBatteryAndTime}
        onPress={() =>
          dispatch(setAppSettings('showBatteryAndTime', !showBatteryAndTime))
        }
        theme={theme}
      />
    </>
  );
};
export default DisplaySettings;
