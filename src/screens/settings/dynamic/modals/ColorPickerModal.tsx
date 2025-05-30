import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Modal, overlay, Portal, TextInput } from 'react-native-paper';
import { List } from '@components';
import { ThemeColors } from '@theme/types';
import { useBoolean } from '@hooks/index';
import { ColorPickerSetting } from '@screens/settings/Settings.d';
import { useMMKVString } from 'react-native-mmkv';
import { useKeyboardHeight } from '@hooks/common/useKeyboardHeight';
import { useChapterReaderSettings } from '@hooks/persisted';

interface ColorPickerModalProps {
  settings: ColorPickerSetting;
  theme: ThemeColors;
  showAccentColors?: boolean;
  quickSettings?: boolean;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  theme,
  settings,
  showAccentColors,
  quickSettings,
}) => {
  const [error, setError] = useState<string | null>();
  const modalRef = useBoolean();
  const keyboardHeight = useKeyboardHeight();

  const [, setCustomAccentColor] = useMMKVString('CUSTOM_ACCENT_COLOR');
  const {
    setChapterReaderSettings,
    theme: t,
    textColor,
  } = useChapterReaderSettings();

  const currentValue =
    settings.settingOrigin === 'MMKV'
      ? rgbToHex(theme.primary)
      : settings.valueKey === 'textColor'
      ? textColor
      : t;
  const [text, setText] = useState<string>(currentValue);

  const update = (val: string) => {
    setText(val);
    if (settings.settingOrigin === 'MMKV') {
      setCustomAccentColor(val);
    } else {
      setChapterReaderSettings({
        [settings.valueKey]: val,
      });
    }
  };

  const onDismiss = () => {
    modalRef.setFalse();
    if (error) {
      setText(currentValue);
    }
    setError(null);
  };

  const onOpen = () => {
    modalRef.setTrue();
    setText(currentValue);
  };

  const onSubmitEditing = () => {
    setError(null);
    const re = /^#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})$/i;
    let t;
    try {
      t = rgbToHex(text);
    } catch (error) {
      setError(typeof error === 'string' ? error : '');
      return;
    }

    if (t.match(re)) {
      update(t);
      onDismiss();
    } else {
      setError('Enter a valid hex color code');
    }
  };

  const accentColors = [
    '#EF5350',
    '#EC407A',
    '#AB47BC',
    '#7E57C2',
    '#5C6BC0',
    '#42A5F5',
    '#29B6FC',
    '#26C6DA',
    '#26A69A',
    '#66BB6A',
    '#9CCC65',
    '#D4E157',
    '#FFEE58',
    '#FFCA28',
    '#FFA726',
    '#FF7043',
    '#8D6E63',
    '#BDBDBD',
    '#78909C',
    '#000000',
  ];

  return (
    <>
      <List.ColorItem
        title={settings.title}
        description={
          quickSettings ? undefined : settings.description?.(currentValue) ?? ''
        }
        onPress={onOpen}
        theme={theme}
      />
      <Portal>
        <Modal
          visible={modalRef.value}
          onDismiss={onDismiss}
          contentContainerStyle={[
            styles.modalContainer,
            {
              backgroundColor: overlay(2, theme.surface),
            },
            !!keyboardHeight && styles.keyboardAvoiding,
            !!keyboardHeight && {
              marginBottom: keyboardHeight,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {settings.title}
          </Text>
          {showAccentColors ? (
            <FlatList
              contentContainerStyle={styles.marginBottom}
              data={accentColors}
              numColumns={4}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <View
                  style={[
                    {
                      backgroundColor: item,
                    },
                    styles.flatList,
                  ]}
                >
                  <Pressable
                    style={styles.flex}
                    android_ripple={{
                      color: 'rgba(0,0,0,0.12)',
                    }}
                    onPress={() => {
                      update(item);
                      onDismiss();
                    }}
                  />
                </View>
              )}
            />
          ) : null}
          <TextInput
            value={text}
            defaultValue={typeof currentValue === 'string' ? currentValue : ''}
            placeholder="Hex Color Code (E.g. #3399FF)"
            onChangeText={setText}
            onSubmitEditing={onSubmitEditing}
            mode="outlined"
            theme={{ colors: { ...theme } }}
            underlineColor={theme.outline}
            dense
            error={Boolean(error)}
          />
          <Text style={styles.errorText}>{error}</Text>
        </Modal>
      </Portal>
    </>
  );
  function componentToHex(c: number) {
    if (c > 256 || c < 0) {
      setError('No valid rgb value');
    }
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  function rgbToHex(rgb: string) {
    if (!rgb.match(/rgb\(/i)) {
      return rgb;
    }
    const match = rgb.match(/\d+/g);
    if (match?.length !== 3) {
      throw 'No valid rgb value';
    }
    let r, g, b;
    try {
      r = parseInt(match[0], 10);
      g = parseInt(match[1], 10);
      b = parseInt(match[2], 10);
    } catch {
      throw 'No valid rgb value';
    }
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
};

export default ColorPickerModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF0033',
    paddingTop: 8,
  },
  flatList: {
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1 / 4,
    height: 40,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  marginBottom: {
    marginBottom: 8,
  },
  flex: { flex: 1 },
  keyboardAvoiding: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: 'auto',
  },
});
