import React, { useState } from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';

import { Appbar, Button, List } from '@components';
import { useTheme } from '@hooks/persisted';
import { useTranslationSettings } from '@hooks/persisted/useSettings';

import SettingSwitch from './components/SettingSwitch';
import ModelDropdown from './components/ModelDropdown';
import { getString } from '@strings/translations';
import {
  TextInput,
  Text,
  Divider,
  Card,
  TouchableRipple,
} from 'react-native-paper';
import { deleteAllTranslations } from '@database/queries/TranslationQueries';
import { showToast } from '@utils/showToast';
import { testConnection } from '@services/translation/TranslationService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fixTranslationColumn } from '@services/migration/DatabaseMigration';

const TranslationSettings = ({ navigation }) => {
  const theme = useTheme();
  const {
    apiKey,
    defaultInstruction,
    model,
    autoTranslate,
    setTranslationSettings,
  } = useTranslationSettings();

  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [modelInput, setModelInput] = useState(model);
  const [instructionInput, setInstructionInput] = useState(defaultInstruction);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isFixingDb, setIsFixingDb] = useState(false);

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setTranslationSettings({
        apiKey: apiKeyInput,
        model: modelInput,
        defaultInstruction: instructionInput,
      });
      showToast(getString('translation.settingsSaved'));
    } catch (error) {
      showToast(
        `${getString('common.error')}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const result = await testConnection(apiKeyInput, modelInput);

      // Show result in an alert for better visibility
      Alert.alert(
        result.success
          ? 'Connection Test Successful'
          : 'Connection Test Failed',
        result.message,
        [{ text: 'OK' }],
      );
    } catch (error) {
      showToast(
        `Test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleFixDatabase = async () => {
    try {
      setIsFixingDb(true);
      await fixTranslationColumn();
    } catch (error) {
      showToast(
        `Database fix failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setIsFixingDb(false);
    }
  };

  const handleDeleteAllTranslations = async () => {
    try {
      await deleteAllTranslations();
      showToast(getString('translation.allDeleted', { count: '?' }));
    } catch (error) {
      showToast(getString('translation.deleteError', { error: error.message }));
    }
  };

  const setRecommendedModel = modelId => {
    setModelInput(modelId);
    showToast(`Model set to ${modelId}`);
  };

  const openOpenRouterWebsite = () => {
    Linking.openURL('https://openrouter.ai/keys');
  };

  const openModelDocs = () => {
    Linking.openURL('https://openrouter.ai/docs/models');
  };

  return (
    <>
      <Appbar
        title={getString('translation.settings')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('translation.apiSettings')}
          </List.SubHeader>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={{ color: theme.onSurface, marginBottom: 8 }}>
                To use translation, you need an OpenRouter API key:
              </Text>
              <TouchableRipple onPress={openOpenRouterWebsite}>
                <View style={styles.link}>
                  <Icon name="open-in-new" size={16} color={theme.primary} />
                  <Text style={{ color: theme.primary, marginLeft: 8 }}>
                    Get an API key from OpenRouter
                  </Text>
                </View>
              </TouchableRipple>
            </Card.Content>
          </Card>

          <TextInput
            label={getString('translation.apiKey')}
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            style={{ margin: 16, backgroundColor: theme.surface }}
            theme={{ colors: { primary: theme.primary } }}
            secureTextEntry
          />

          <Text
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              color: theme.onSurface,
            }}
          >
            {getString('translation.model')}
          </Text>
          <ModelDropdown
            value={modelInput}
            onChange={setModelInput}
            theme={theme}
          />

          <Card style={{ ...styles.card, marginBottom: 16 }}>
            <Card.Title title="Recommended Models" />
            <Card.Content>
              <TouchableRipple
                onPress={() =>
                  setRecommendedModel('anthropic/claude-3-haiku-20240307')
                }
                style={styles.modelOption}
              >
                <View>
                  <Text style={{ color: theme.onSurface, fontWeight: 'bold' }}>
                    Claude 3 Haiku
                  </Text>
                  <Text style={{ color: theme.onSurfaceVariant, fontSize: 12 }}>
                    Good for translations, wider availability
                  </Text>
                </View>
              </TouchableRipple>

              <Divider style={styles.divider} />

              <TouchableRipple
                onPress={() =>
                  setRecommendedModel('anthropic/claude-3-sonnet-20240229')
                }
                style={styles.modelOption}
              >
                <View>
                  <Text style={{ color: theme.onSurface, fontWeight: 'bold' }}>
                    Claude 3 Sonnet
                  </Text>
                  <Text style={{ color: theme.onSurfaceVariant, fontSize: 12 }}>
                    Better quality, costs more
                  </Text>
                </View>
              </TouchableRipple>

              <Divider style={styles.divider} />

              <TouchableRipple
                onPress={() => setRecommendedModel('openai/gpt-3.5-turbo')}
                style={styles.modelOption}
              >
                <View>
                  <Text style={{ color: theme.onSurface, fontWeight: 'bold' }}>
                    GPT-3.5 Turbo
                  </Text>
                  <Text style={{ color: theme.onSurfaceVariant, fontSize: 12 }}>
                    Cheaper option, lower quality
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                onPress={openModelDocs}
                style={{ marginTop: 16 }}
              >
                <View style={styles.link}>
                  <Icon
                    name="information-outline"
                    size={16}
                    color={theme.primary}
                  />
                  <Text style={{ color: theme.primary, marginLeft: 8 }}>
                    Learn more about available models
                  </Text>
                </View>
              </TouchableRipple>
            </Card.Content>
          </Card>

          <TextInput
            label={getString('translation.instruction')}
            value={instructionInput}
            onChangeText={setInstructionInput}
            style={{ margin: 16, backgroundColor: theme.surface }}
            theme={{ colors: { primary: theme.primary } }}
            multiline
            numberOfLines={4}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 16,
            }}
          >
            <Button
              title={isSaving ? '...' : getString('translation.saveSettings')}
              onPress={saveSettings}
              mode="contained"
              style={{ flex: 1, marginRight: 8 }}
              disabled={isSaving || isTesting}
            />
            <Button
              title={isTesting ? '...' : 'Test Connection'}
              onPress={handleTestConnection}
              mode="outlined"
              style={{ flex: 1, marginLeft: 8 }}
              disabled={isSaving || isTesting || !apiKeyInput || !modelInput}
            />
          </View>

          {(isSaving || isTesting) && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={{ marginTop: 16, marginBottom: 16 }}
            />
          )}

          <Text
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              color: theme.onSurfaceVariant,
              fontSize: 12,
            }}
          >
            Note: The "No endpoints found matching your data policy" error
            usually means the selected model is not available with your current
            OpenRouter API key or plan.
          </Text>
        </List.Section>

        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('translation.options')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('translation.autoTranslate')}
            value={autoTranslate}
            onPress={() =>
              setTranslationSettings({ autoTranslate: !autoTranslate })
            }
            theme={theme}
          />
          <Button
            title={getString('translation.manageTranslations')}
            onPress={() => navigation.navigate('TranslationList')}
            mode="contained"
            style={{ margin: 16 }}
            color={theme.primary}
          />
          <Button
            title={getString('translation.deleteAll')}
            onPress={handleDeleteAllTranslations}
            mode="outlined"
            style={{ margin: 16 }}
            color={theme.error}
          />
        </List.Section>

        <List.Section>
          <List.SubHeader theme={theme}>Troubleshooting</List.SubHeader>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={{ color: theme.onSurface, marginBottom: 12 }}>
                If you see "no such column: hasTranslation" errors, use this
                button to fix the database:
              </Text>
              <Button
                title={isFixingDb ? 'Fixing Database...' : 'Fix Database'}
                onPress={handleFixDatabase}
                mode="contained"
                color={theme.primary}
                disabled={isFixingDb}
              />
              {isFixingDb && (
                <ActivityIndicator
                  size="small"
                  color={theme.primary}
                  style={{ marginTop: 12 }}
                />
              )}
            </Card.Content>
          </Card>
        </List.Section>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 8,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelOption: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
});

export default TranslationSettings;
