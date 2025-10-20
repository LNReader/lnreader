import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { Modal } from '@components';

interface SelectOneModalProps {
  title: string,
  description?: string,

  options: Record<string, string>;
  value: string;
  setValue: (v: string) => void;

  visible: boolean;
  dismiss: () => void;

  theme: ThemeColors;
}

const SelectOneModal: React.FC<SelectOneModalProps> = ({
  title,
  description,
  options,
  value,
  setValue,
  visible,
  dismiss,
  theme
}) => {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={dismiss}>
        <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
          {title}
        </Text>
        { description &&
          <Text
            style={[styles.modalDescription, { color: theme.onSurfaceVariant }]}
          >
            {description}
          </Text> 
        }
        {Object.keys(options).map((key) => (
          <RadioButton
            key={key}
            status={value === key}
            onPress={() => setValue(key)}
            label={options[key] || key}
            theme={theme}
          />
        ))}
      </Modal>
    </Portal>
  );
  
}

export default SelectOneModal;

const styles = StyleSheet.create({
  modalHeader: {
    fontSize: 24,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
});
