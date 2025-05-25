import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { useLibrarySettings } from '@hooks/persisted';
import { Checkbox, List } from '@components';
import { useBoolean } from '@hooks/index';
import { ModalSetting, ModalSettingsType } from '@screens/settings/Settings.d';
import { useAppSettings } from '@hooks/persisted/useSettings';
import { SortItem } from '@components/Checkbox/Checkbox';
import useUpdateSettingsFn from '../functions/useUpdateSettingsFn';

interface DisplayModeModalProps {
  setting: ModalSetting;
  theme: ThemeColors;
  quickSettings?: boolean;
}

type Value<T extends ModalSettingsType['mode']> = T extends 'multiple'
  ? Array<boolean>
  : boolean | string | number;

const SelectionSettingModal: React.FC<DisplayModeModalProps> = ({
  theme,
  setting,
  quickSettings,
}) => {
  const modalRef = useBoolean();

  const librarySettings = useLibrarySettings();
  const appSettings = useAppSettings();

  const update = useUpdateSettingsFn(setting.settingOrigin);

  const mode = setting.mode;
  const currentValue: Value<typeof mode> = useMemo(() => {
    if (setting.mode === 'single' || setting.mode === 'order') {
      if (setting.settingOrigin === 'Library') {
        return librarySettings[setting.valueKey] ?? setting.defaultValue;
      } else {
        return appSettings[setting.valueKey] ?? setting.defaultValue;
      }
    } else if (setting.mode === 'multiple') {
      if (setting.settingOrigin === 'Library') {
        return setting.options.map(k => {
          return librarySettings[k.key] ?? k.defaultValue;
        }) as Array<boolean>;
      } else {
        return setting.options.map(k => {
          return appSettings[k.key] ?? k.defaultValue;
        }) as Array<boolean>;
      }
    }
    return 0;
  }, [
    setting.mode,
    setting.settingOrigin,
    setting.valueKey,
    setting.defaultValue,
    setting.options,
    librarySettings,
    appSettings,
  ]);

  function generateDescription() {
    if (!setting.description || quickSettings) {
      return;
    }
    //@ts-expect-error
    return setting.description(currentValue);
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
          {mode === 'single'
            ? setting.options.map(m => (
                <RadioButton
                  key={m.value}
                  status={currentValue === m.value}
                  onPress={() => update(m.value, setting.valueKey)}
                  label={m.label}
                  theme={theme}
                />
              ))
            : mode === 'multiple'
            ? setting.options.map((m, i) => {
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
            : mode === 'order'
            ? setting.options.map(m => {
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
