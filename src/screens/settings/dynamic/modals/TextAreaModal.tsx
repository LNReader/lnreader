import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Portal } from 'react-native-paper';

import { Button, ConfirmationDialog } from '@components';

import { useBoolean } from '@hooks';
import { getString } from '@strings/translations';

import CustomFileModal from './CustomFileModal';
import {
  BaseSetting,
  SettingOrigin,
  TextAreaSetting,
} from '@screens/settings/Settings';
import { ThemeColors } from '@theme/types';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { FilteredSettings } from '@screens/settings/constants/defaultValues';

const TextAreaModal = ({
  setting,
  theme,
}: {
  setting: TextAreaSetting & BaseSetting;
  theme: ThemeColors;
}) => {
  const showModal = useBoolean();
  const clearModal = useBoolean();

  const { setSettings, ...settings } = useSettingsContext();

  const currentValue = useMemo(() => {
    return settings[setting.valueKey];
  }, [setting.valueKey, settings]);

  const update = (
    value: string,
    key: FilteredSettings<string>,
    origin?: SettingOrigin,
  ) => {
    if (origin) {
      throw new Error(`origin: ${origin}. Is not implemented`);
    }
    setSettings({
      [key]: value,
    });
  };

  return (
    <>
      <View style={styles.customCSSContainer}>
        <Text numberOfLines={3} style={[{ color: theme.onSurface }]}>
          {currentValue ||
            `${getString('common.example')}: ${setting.placeholder}`}
        </Text>
        <View style={styles.customCSSButtons}>
          <Button
            onPress={showModal.setTrue}
            style={styles.marginLeftS}
            title={getString('common.edit')}
          />
          <Button
            onPress={clearModal.setTrue}
            title={getString('common.clear')}
          />
        </View>
      </View>

      {/* Modals */}
      <Portal>
        <CustomFileModal
          visible={showModal.value}
          onDismiss={showModal.setFalse}
          defaultValue={currentValue}
          mimeType="text/css"
          title={setting.title}
          description={setting.description}
          placeholder={`${getString('common.example')}: ${setting.placeholder}`}
          openFileLabel={setting.openFileLabel}
          onSave={text => {
            update(text, setting.valueKey);
          }}
        />
        <ConfirmationDialog
          title={setting.clearDialog}
          visible={clearModal.value}
          onSubmit={() => {
            update('', setting.valueKey);
          }}
          onDismiss={clearModal.setFalse}
          theme={theme}
        />
      </Portal>
    </>
  );
};
export default TextAreaModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  fontSizeL: {
    fontSize: 16,
  },
  customCSSContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  buttons: {
    flex: 1,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customCSSButtons: {
    marginVertical: 8,
    flex: 1,
    flexDirection: 'row-reverse',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
});
