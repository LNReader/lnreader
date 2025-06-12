import { List } from '@components';
import { useSettingsContext } from '@components/Context/SettingsContext';
import KeyboardAvoidingModal from '@components/Modal/KeyboardAvoidingModal';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import React, { useMemo, useRef } from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

type ReplaceItemModalProps = {};

const ReplaceItemModal = ({}: ReplaceItemModalProps) => {
  const theme = useTheme();
  const modal = useBoolean(false);
  const { setSettings, replaceText } = useSettingsContext();

  const textRef = useRef<RNTextInput>(null);
  const replaceTextRef = useRef<RNTextInput>(null);

  const [text, setText] = React.useState('');
  const [replacementText, setReplacementText] = React.useState('');

  const cancel = () => {
    textRef.current?.clear();
    replaceTextRef.current?.clear();
  };

  const save = () => {
    if (!text || !replacementText) return;
    if (text === undefined || replacementText === undefined) return;
    replaceText.set(text, replacementText);
    setSettings({ replaceText: replaceText });
    cancel();
  };

  const colorTheme = useMemo(() => {
    return { colors: theme };
  }, [theme]);

  return (
    <>
      <List.Item
        title={'Replace'}
        description={'Replace text'}
        theme={theme}
        right="plus"
        onPress={modal.setTrue}
      />
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
});
