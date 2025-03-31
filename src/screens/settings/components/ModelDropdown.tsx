import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  fetchAvailableModels,
  OpenRouterModel,
} from '@services/translation/TranslationService';
import { ThemeColors } from '@theme/types';
import { showToast } from '@utils/showToast';

interface ModelDropdownProps {
  value: string;
  onChange: (modelId: string) => void;
  theme: ThemeColors;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({
  value,
  onChange,
  theme,
}) => {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const availableModels = await fetchAvailableModels();
        setModels(availableModels);
      } catch (error) {
        console.error('Failed to load models:', error);
        showToast(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const filteredModels = searchQuery
    ? models.filter(
        model =>
          model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : models;

  const selectedModel = models.find(model => model.id === value) || {
    id: value,
    name: value || 'Select a model',
  };

  const renderItem = ({ item }: { item: OpenRouterModel }) => {
    let pricing = '';
    if (item.pricing) {
      const promptPrice = parseFloat(item.pricing.prompt) * 1000000;
      const completionPrice = parseFloat(item.pricing.completion) * 1000000;
      pricing = `${promptPrice.toFixed(2)}μ$ prompt, ${completionPrice.toFixed(
        2,
      )}μ$ completion`;
    }

    return (
      <TouchableOpacity
        style={[
          styles.modelItem,
          {
            backgroundColor:
              item.id === value ? theme.primaryContainer : theme.surface,
          },
        ]}
        onPress={() => {
          onChange(item.id);
          setModalVisible(false);
        }}
      >
        <View style={styles.modelItemContent}>
          <Text style={[styles.modelName, { color: theme.onSurface }]}>
            {item.name}
          </Text>
          {item.description ? (
            <Text
              style={[
                styles.modelDescription,
                { color: theme.onSurfaceVariant },
              ]}
            >
              {item.description}
            </Text>
          ) : null}
          {pricing ? (
            <Text
              style={[styles.modelPricing, { color: theme.onSurfaceVariant }]}
            >
              {pricing}
            </Text>
          ) : null}
        </View>
        {item.id === value ? (
          <Icon name="check" size={24} color={theme.primary} />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.input, { backgroundColor: theme.surface }]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[styles.selectedText, { color: theme.onSurface }]}
          numberOfLines={1}
        >
          {selectedModel.name}
        </Text>
        <Icon name="chevron-down" size={24} color={theme.onSurface} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modal, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
                Models
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.onSurface} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search models..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginBottom: 12, backgroundColor: theme.surface }}
              theme={{ colors: { primary: theme.primary } }}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.onSurface }]}>
                  Loading models...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredModels}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 8,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  modelItemContent: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  modelPricing: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default ModelDropdown;
