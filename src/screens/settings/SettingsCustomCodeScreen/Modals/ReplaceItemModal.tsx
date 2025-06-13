import { IconButtonV2, List } from '@components';
import { useSettingsContext } from '@components/Context/SettingsContext';
import KeyboardAvoidingModal from '@components/Modal/KeyboardAvoidingModal';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import Icon from '@react-native-vector-icons/material-design-icons';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  Dimensions,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const windowDimensions = Dimensions.get('window');
const fontSize = 14 * windowDimensions.fontScale;
const lineHeight = fontSize * 1.2;

type ReplaceItemModalProps = { showReplace?: boolean };

const ReplaceItemModal = ({ showReplace = false }: ReplaceItemModalProps) => {
  const theme = useTheme();
  const modal = useBoolean(false);
  const listExpanded = useBoolean(false);
  const { setSettings, replaceText, removeText } = useSettingsContext();
  const replaceArray = useMemo(() => {
    return Object.entries(replaceText);
  }, [replaceText]);

  const arrayLength = showReplace ? replaceArray.length : removeText.length;

  const textRef = useRef<RNTextInput>(null);
  const replaceTextRef = useRef<RNTextInput>(null);

  const [text, setText] = React.useState('');
  const [replacementText, setReplacementText] = React.useState('');
  const listSize = useSharedValue<number | `${number}%`>(
    Math.min(110, arrayLength * 48),
  );

  const cancel = () => {
    textRef.current?.clear();
    setText('');
    if (showReplace) {
      replaceTextRef.current?.clear();
      setReplacementText('');
    }
  };

  const save = () => {
    if (!text || (showReplace && !replacementText)) return;
    if (text === undefined || (showReplace && replacementText === undefined)) {
      return;
    }

    if (showReplace) {
      replaceText[text] = replacementText;
      setSettings({ replaceText: replaceText });
    } else {
      removeText.push(text);
      setSettings({ removeText: removeText });
    }
    cancel();
  };

  const removeItem = useCallback(
    (identifier: string | number) => {
      if (showReplace) {
        delete replaceText[identifier];
        setSettings({ replaceText: replaceText });
      } else {
        removeText.splice(identifier as number, 1);
        setSettings({ removeText: removeText });
      }
    },
    [removeText, replaceText, setSettings, showReplace],
  );

  const colorTheme = useMemo(() => {
    return { colors: theme };
  }, [theme]);

  const ReplaceItem = useCallback(
    ({ item }: { item: [string, string] }) => {
      return (
        <View style={styles.itemRow}>
          <Text numberOfLines={1} style={styles.textItem} theme={colorTheme}>
            {item[0]}
          </Text>
          <Text numberOfLines={1} style={styles.spaceItem} theme={colorTheme}>
            {' -> '}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.textItem, styles.textItemRight]}
            theme={colorTheme}
          >
            {item[1]}
          </Text>
          <Icon
            name="trash-can-outline"
            size={20}
            color={theme.onBackground}
            onPress={() => removeItem(item[0])}
          />
        </View>
      );
    },
    [colorTheme, removeItem, theme.onBackground],
  );
  const RemoveItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      return (
        <View style={styles.itemRow}>
          <Text numberOfLines={1} style={styles.textItem} theme={colorTheme}>
            {item}
          </Text>
          <Icon
            name="trash-can-outline"
            size={20}
            color={theme.onBackground}
            onPress={() => removeItem(index)}
          />
        </View>
      );
    },
    [colorTheme, removeItem, theme.onBackground],
  );

  const toggleList = () => {
    if (listExpanded.value) {
      listSize.value = Math.min(110, arrayLength * (lineHeight + 16));
    } else {
      listSize.value = Math.min(
        WINDOW_HEIGHT * 0.6,
        arrayLength * (lineHeight + 16),
      );
    }
    listExpanded.toggle();
  };

  const animatedListSize = useAnimatedStyle(() => ({
    height: withTiming(listSize.value, { duration: 250 }),
    overflow: 'hidden',
    position: 'relative',
  }));

  return (
    <>
      <List.Item
        title={showReplace ? 'Replace' : 'Remove'}
        description={showReplace ? 'Replace text' : 'Remove text'}
        theme={theme}
        right="plus"
        onPress={modal.setTrue}
      />
      <Animated.View style={animatedListSize}>
        {arrayLength <= 3 || listExpanded.value ? null : (
          <LinearGradient
            colors={['transparent', 'transparent', theme.background]}
            style={styles.gradient}
            onTouchEnd={toggleList}
          />
        )}
        {showReplace ? (
          <FlashList
            estimatedItemSize={46}
            data={replaceArray}
            renderItem={ReplaceItem}
          />
        ) : (
          <FlashList
            estimatedItemSize={46}
            data={removeText}
            renderItem={RemoveItem}
          />
        )}
      </Animated.View>
      {!listExpanded.value ? null : (
        <IconButtonV2
          name="menu-up"
          theme={theme}
          onPress={toggleList}
          style={styles.marginHorizontal}
          color={theme.primary}
        />
      )}
      <KeyboardAvoidingModal
        visible={modal.value}
        onDismiss={modal.setFalse}
        onSave={save}
        onCancel={cancel}
        title="Edit Replace"
      >
        <TextInput
          ref={textRef}
          label={'match'}
          theme={colorTheme}
          defaultValue={text}
          onChangeText={setText}
          autoCorrect={false}
          mode="outlined"
          style={styles.textfield}
        />
        {!showReplace ? null : (
          <TextInput
            ref={replaceTextRef}
            label={'replace'}
            theme={colorTheme}
            defaultValue={replacementText}
            onChangeText={setReplacementText}
            autoCorrect={false}
            mode="outlined"
            style={[styles.textfield, styles.bottom]}
          />
        )}
      </KeyboardAvoidingModal>
    </>
  );
};

export default ReplaceItemModal;

const styles = StyleSheet.create({
  textfield: {
    marginBottom: 16,
  },
  bottom: {
    marginBottom: 24,
  },
  marginHorizontal: {
    marginHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 8,
    gap: 8,
    height: Math.max(lineHeight, 20),
  },
  textItem: {
    flexGrow: 1,
    flexBasis: '0%',
    overflow: 'hidden',
    fontSize,
    lineHeight: lineHeight,
  },
  textItemRight: {
    textAlign: 'right',
  },
  spaceItem: {
    flexShrink: 1,
    textAlign: 'center',
    flexBasis: '10%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
