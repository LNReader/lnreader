import React, { useState } from 'react';
import { View, Text, Button, Divider } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getString } from '../../utils/strings';

const TranslationsSettings = () => {
  const navigation = useNavigation();
  const [_confirmDeleteAll, _setConfirmDeleteAll] = useState(false);

  const handleDeleteAll = () => {
    // Implement the logic to delete all translations
    console.log('Deleting all translations');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getString('translation.title')}</Text>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {getString('translation.options')}
        </Text>
        <Button
          mode="outlined"
          style={styles.button}
          icon="translate"
          onPress={() => navigation.navigate('TranslationList')}
        >
          {getString('translation.manageTranslations')}
        </Button>
        <Button
          mode="outlined"
          style={styles.button}
          icon="delete"
          onPress={handleDeleteAll}
        >
          {getString('translation.deleteAll')}
        </Button>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    marginBottom: 10,
  },
};

export default TranslationsSettings;
