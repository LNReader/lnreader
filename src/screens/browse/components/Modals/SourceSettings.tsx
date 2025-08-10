import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Button, Modal, SwitchItem } from '@components/index';
import { useTheme } from '@providers/ThemeProvider';
import { getString } from '@strings/translations';
import { Storage } from '@plugins/helpers/storage';

interface PluginSetting {
  value: string;
  label: string;
  type?: 'Switch';
}

interface PluginSettings {
  [key: string]: PluginSetting;
}

interface SourceSettingsModal {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description?: string;
  pluginId: string;
  pluginSettings?: PluginSettings;
}

const SourceSettingsModal: React.FC<SourceSettingsModal> = ({
  onDismiss,
  visible,
  title,
  description,
  pluginId,
  pluginSettings,
}) => {
  const theme = useTheme();

  const [formValues, setFormValues] = useState<
    Record<string, string | boolean>
  >({});

  useEffect(() => {
    if (pluginSettings) {
      const storage = new Storage(pluginId);

      const loadFormValues = async () => {
        const loadedValues = await Promise.all(
          Object.keys(pluginSettings).map(async key => {
            const storedValue = await storage.get(key);
            return {
              key,
              value:
                storedValue !== null ? storedValue : pluginSettings[key].value,
            };
          }),
        );

        const initialFormValues = Object.fromEntries(
          loadedValues.map(({ key, value }) => [key, value]),
        );

        setFormValues(initialFormValues);
      };

      loadFormValues();
    }
  }, [pluginSettings, pluginId]);

  const handleChange = (key: string, value: string | boolean) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const storage = new Storage(pluginId);
    Object.entries(formValues).forEach(([key, value]) => {
      storage.set(key, value);
    });
    onDismiss();
  };

  if (!pluginSettings || Object.keys(pluginSettings).length === 0) {
    return (
      <Modal visible={visible} onDismiss={onDismiss}>
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {title}
        </Text>
        <Text style={{ color: theme.onSurfaceVariant }}>
          {description || 'No settings available.'}
        </Text>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
        {title}
      </Text>
      <Text style={{ color: theme.onSurfaceVariant }}>{description}</Text>
      {Object.entries(pluginSettings).map(([key, setting]) => {
        if (setting?.type === 'Switch') {
          return (
            <SwitchItem
              key={key}
              value={!!formValues[key]}
              label={setting.label}
              onPress={() => handleChange(key, !formValues[key])}
              theme={theme}
            />
          );
        }
        return (
          <TextInput
            key={key}
            mode="outlined"
            label={setting.label}
            value={(formValues[key] ?? '') as string}
            onChangeText={value => handleChange(key, value)}
            placeholder={`Enter ${setting.label}`}
            placeholderTextColor={theme.onSurfaceDisabled}
            underlineColor={theme.outline}
            style={[{ color: theme.onSurface }, styles.textInput]}
            theme={{ colors: { ...theme } }}
          />
        );
      })}
      <View style={styles.customCSSButtons}>
        <Button
          onPress={handleSave}
          style={styles.button}
          title={getString('common.save')}
          mode="contained"
        />
      </View>
    </Modal>
  );
};

export default SourceSettingsModal;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 16,
  },
  customCSSButtons: {
    flexDirection: 'row',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  textInput: {
    borderRadius: 14,
    fontSize: 16,
    height: 50,
    marginBottom: 8,
    marginTop: 16,
  },
});
