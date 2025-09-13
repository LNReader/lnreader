import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { Checkbox, List } from '@components';
import { useBoolean } from '@hooks/index';
import { BaseSetting, ModalSetting } from '@screens/settings/Settings';
import { SortItem } from '@components/Checkbox/Checkbox';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { FilteredSettings } from '@screens/settings/constants/defaultValues';

interface DisplayModeModalProps {
  setting: ModalSetting & BaseSetting;
  theme: ThemeColors;
  quickSettings?: boolean;
}

const SelectionSettingModal: React.FC<DisplayModeModalProps> = ({
  theme,
  setting,
  quickSettings,
}) => {
  const modalRef = useBoolean();

  const { setSettings, ...settings } = useSettingsContext();

  const currentValue = useMemo(() => {
    if (setting.mode === 'multiple') {
      return setting.options.map((k: any) => {
        return (settings as any)[k.key];
      }) as Array<boolean>;
    }
    return settings[setting.valueKey];
  }, [setting.mode, setting.options, setting.valueKey, settings]);

  function update<T extends string | number | boolean>(
    value: T,
    key: FilteredSettings<T>,
  ) {
    setSettings({
      [key]: value,
    });
  }

  function generateDescription() {
    if (!setting.description || quickSettings) {
      return undefined;
    }
    return typeof setting.description === 'string'
      ? setting.description
      : undefined;
  }

  return (
    <>
      <List.Item
        title={setting.title}
        description={generateDescription()}
        onPress={modalRef.setTrue}
        theme={theme}
      />
      <Portal>
        <Modal
          visible={modalRef.value}
          onDismiss={modalRef.setFalse}
          contentContainerStyle={[
            styles.containerStyle,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
            {setting.title}
          </Text>
          {setting.mode === 'single'
            ? setting.options.map((m: any) => (
                <RadioButton
                  key={m.value}
                  status={currentValue === m.value}
                  onPress={() => update(m.value, setting.valueKey)}
                  label={m.label}
                  theme={theme}
                />
              ))
            : setting.mode === 'multiple'
            ? setting.options.map((m: any, i: number) => {
                const value = (currentValue as Array<boolean>)[i];
                return (
                  <Checkbox
                    key={m.label}
                    label={m.label}
                    status={value}
                    onPress={() => update(!value, m.key)}
                    theme={theme}
                  />
                );
              })
            : setting.mode === 'order'
            ? setting.options.map((m: any) => {
                return (
                  <SortItem
                    key={m.label}
                    label={m.label}
                    theme={theme}
                    status={
                      currentValue === m.ASC
                        ? 'asc'
                        : currentValue === m.DESC
                        ? 'desc'
                        : undefined
                    }
                    onPress={() =>
                      update(
                        currentValue === m.ASC ? m.DESC : m.ASC,
                        setting.valueKey,
                      )
                    }
                  />
                );
              })
            : null}
        </Modal>
      </Portal>
    </>
  );
};

export default React.memo(SelectionSettingModal);

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 28,
  },
  modalHeader: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 10,
  },
});
