import React, { useMemo, startTransition } from 'react';
import { Text } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { Checkbox, List } from '@components';
import { useBoolean } from '@hooks/index';
import { BaseSetting, ModalSetting } from '@screens/settings/Settings';
import { SortItem } from '@components/Checkbox/Checkbox';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { FilteredSettings } from '@screens/settings/constants/defaultValues';
import { sharedStyles } from '../utils/sharedStyles';

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
      return setting.options.map((option: any) => {
        return (settings as any)[option.key];
      }) as Array<boolean>;
    }
    return settings[setting.valueKey];
  }, [setting.mode, setting.options, setting.valueKey, settings]);

  function update<T extends string | number | boolean>(
    value: T,
    key: FilteredSettings<T>,
  ) {
    startTransition(() =>
      setSettings({
        [key]: value,
      }),
    );
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
            sharedStyles.modalContainer,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          {modalRef.value ? (
            <>
              <Text
                style={[sharedStyles.modalHeader, { color: theme.onSurface }]}
              >
                {setting.title}
              </Text>
              {setting.mode === 'single'
                ? setting.options.map((option: any) => (
                    <RadioButton
                      key={option.value}
                      status={currentValue === option.value}
                      onPress={() => update(option.value, setting.valueKey)}
                      label={option.label}
                      theme={theme}
                    />
                  ))
                : setting.mode === 'multiple'
                ? setting.options.map((option: any, i: number) => {
                    const value = (currentValue as Array<boolean>)[i];
                    return (
                      <Checkbox
                        key={option.label}
                        label={option.label}
                        status={value}
                        onPress={() => update(!value, option.key)}
                        theme={theme}
                      />
                    );
                  })
                : setting.mode === 'order'
                ? setting.options.map((option: any) => {
                    return (
                      <SortItem
                        key={option.label}
                        label={option.label}
                        theme={theme}
                        status={
                          currentValue === option.ASC
                            ? 'asc'
                            : currentValue === option.DESC
                            ? 'desc'
                            : undefined
                        }
                        onPress={() =>
                          update(
                            currentValue === option.ASC
                              ? option.DESC
                              : option.ASC,
                            setting.valueKey,
                          )
                        }
                      />
                    );
                  })
                : null}
            </>
          ) : null}
        </Modal>
      </Portal>
    </>
  );
};

export default React.memo(SelectionSettingModal);

// Using shared styles instead of local styles
