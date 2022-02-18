import {StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {Appbar, List} from '../../../components';

import {useAppearanceSettings, useTheme} from '../../../redux/hooks';
import {capitalizeFirstLetter} from '../../../utils/capitalizeFirstLetter';
import DisplayModeModal from '../components/DisplayModeModal/DisplayModeModal';
import GridSizeModal from '../components/GridSizeModal/GridSizeModal';

const SettingsGeneral = () => {
  const {goBack} = useNavigation();
  const theme = useTheme();

  const {displayMode, novelsPerRowPotrait} = useAppearanceSettings();

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
