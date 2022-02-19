import {StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {Appbar, List, SwitchItem} from '../../../components';

import {
  useAppDispatch,
  useAppearanceSettings,
  useLibrarySettings,
  useTheme,
  useUpdateSettings,
} from '../../../redux/hooks';
import {capitalizeFirstLetter} from '../../../utils/capitalizeFirstLetter';
import DisplayModeModal from '../components/DisplayModeModal/DisplayModeModal';
import GridSizeModal from '../components/GridSizeModal/GridSizeModal';
import {
  toggleOnlyUpdateOngoingNovels,
  toggleShowLastUpdateTime,
  toggleUpdateLibraryOnLaunch,
  toggleUpdateNovelMetadata,
} from '../../../redux/settings/settingsSlice';

const SettingsGeneral = () => {
  const {goBack} = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {displayMode, novelsPerRowPotrait} = useAppearanceSettings();
  const {onlyUpdateOngoingNovels, updateNovelMetadata, showLastUpdateTime} =
    useUpdateSettings();
  const {updateLibraryOnLaunch} = useLibrarySettings();

  const [displayModeModalVisible, setDisplayModeModalVisible] = useState(false);
  const [gridSizeModalVisible, setGridSizeModalVisible] = useState(false);

  return (
    <>
      <Appbar title="General" handleGoBack={goBack} theme={theme} />
      <List.Section>
        <List.SubHeader theme={theme}>Display</List.SubHeader>
        <List.Item
          title="Display Mode"
          description={capitalizeFirstLetter(displayMode)}
          onPress={() => setDisplayModeModalVisible(true)}
          theme={theme}
        />
        <List.Item
          title="Items per row in library"
          description={novelsPerRowPotrait.toString()}
          onPress={() => setGridSizeModalVisible(true)}
          theme={theme}
        />
        <List.Divider theme={theme} />
        <List.SubHeader theme={theme}>Library</List.SubHeader>
        <SwitchItem
          label="Update library on launch"
          value={updateLibraryOnLaunch}
          onPress={() => dispatch(toggleUpdateLibraryOnLaunch())}
          theme={theme}
        />
        <List.Divider theme={theme} />
        <List.SubHeader theme={theme}>Global update</List.SubHeader>
        <SwitchItem
          label="Only update ongoing novels"
          value={onlyUpdateOngoingNovels}
          onPress={() => dispatch(toggleOnlyUpdateOngoingNovels())}
          theme={theme}
        />
        <SwitchItem
          label="Automatically refresh metadata"
          description="Check for new cover and details when updating library"
          value={updateNovelMetadata}
          onPress={() => dispatch(toggleUpdateNovelMetadata())}
          theme={theme}
        />
        <SwitchItem
          label="Show last update time"
          value={showLastUpdateTime}
          onPress={() => dispatch(toggleShowLastUpdateTime())}
          theme={theme}
        />
      </List.Section>

      <DisplayModeModal
        visible={displayModeModalVisible}
        closeModal={() => setDisplayModeModalVisible(false)}
        theme={theme}
      />
      <GridSizeModal
        visible={gridSizeModalVisible}
        closeModal={() => setGridSizeModalVisible(false)}
        theme={theme}
      />
    </>
  );
};

export default SettingsGeneral;

const styles = StyleSheet.create({});
