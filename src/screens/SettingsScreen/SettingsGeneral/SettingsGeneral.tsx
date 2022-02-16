import {StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {Appbar, List} from '../../../components';

import {useAppearanceSettings, useTheme} from '../../../redux/hooks';
import {capitalizeFirstLetter} from '../../../utils/capitalizeFirstLetter';
import DisplayModeModal from '../components/DisplayModeModal/DisplayModeModal';

const SettingsGeneral = () => {
  const {goBack} = useNavigation();
  const theme = useTheme();

  const {displayMode} = useAppearanceSettings();

  const [displayModeModalVisible, setDisplayModeModalVisible] = useState(false);

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
      </List.Section>

      <DisplayModeModal
        visible={displayModeModalVisible}
        closeModal={() => setDisplayModeModalVisible(false)}
        theme={theme}
      />
    </>
  );
};

export default SettingsGeneral;

const styles = StyleSheet.create({});
