import React from 'react';

import { List, SwitchItem } from '@components/index';

import { useChapterGeneralSettings, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

const DisplaySettings: React.FC = () => {
  const theme = useTheme();

  const {
    fullScreenMode = true,
    showScrollPercentage = true,
    showBatteryAndTime = false,
    setChapterGeneralSettings,
  } = useChapterGeneralSettings();

  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('novelScreen.bottomSheet.display')}
      </List.SubHeader>
      <SwitchItem
        label={getString('readerScreen.bottomSheet.fullscreen')}
        value={fullScreenMode}
        onPress={() =>
          setChapterGeneralSettings({ fullScreenMode: !fullScreenMode })
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.showProgressPercentage')}
        value={showScrollPercentage}
        onPress={() =>
          setChapterGeneralSettings({
            showScrollPercentage: !showScrollPercentage,
          })
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.showBatteryAndTime')}
        value={showBatteryAndTime}
        onPress={() =>
          setChapterGeneralSettings({ showBatteryAndTime: !showBatteryAndTime })
        }
        theme={theme}
      />
    </>
  );
};
export default DisplaySettings;
