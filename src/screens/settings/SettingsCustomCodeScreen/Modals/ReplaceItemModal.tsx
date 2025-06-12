import { List } from '@components';
import { useSettingsContext } from '@components/Context/SettingsContext';
import KeyboardAvoidingModal from '@components/Modal/KeyboardAvoidingModal';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useRef } from 'react';
import { TextInput as RNTextInput, StyleSheet, View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

type ReplaceItemModalProps = { showReplace?: boolean };

const ReplaceItemModal = ({ showReplace = false }: ReplaceItemModalProps) => {
  const theme = useTheme();
  const modal = useBoolean(false);
  const { setSettings, replaceText, removeText } = useSettingsContext();
  const replaceArray = useMemo(() => {
    return Object.entries(replaceText);
  }, [replaceText]);
  const arrayLength = showReplace ? replaceArray.length : removeText.length;

  const textRef = useRef<RNTextInput>(null);
  const replaceTextRef = useRef<RNTextInput>(null);

  const [text, setText] = React.useState('');
  const [replacementText, setReplacementText] = React.useState('');

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
        </View>
      );
    },
    [colorTheme],
  );
  const RemoveItem = useCallback(
    ({ item }: { item: string }) => {
      return (
        <View style={styles.itemRow}>
          <Text numberOfLines={1} style={styles.textItem} theme={colorTheme}>
            {item}
          </Text>
        </View>
      );
    },
    [colorTheme],
  );

  return (
    <>
      <List.Item
        title={showReplace ? 'Replace' : 'Remove'}
        description={showReplace ? 'Replace text' : 'Remove text'}
        theme={theme}
        right="plus"
        onPress={modal.setTrue}
      />
      <View
        style={{
          height: Math.min(100, arrayLength * 48),
          overflow: 'hidden',
          position: 'relative',
        }}
      >
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
      </View>
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 8,
  },
  textItem: {
    flexGrow: 1,
    flexBasis: '0%',
    overflow: 'hidden',
  },
  textItemRight: {
    textAlign: 'right',
  },
  spaceItem: {
    flexShrink: 1,
    textAlign: 'center',
    flexBasis: '10%',
  },
});
