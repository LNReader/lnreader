import { useTheme } from '@hooks/persisted';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, View } from 'react-native';
import { Button } from '@components';
import PickThemeStep from './PickThemeStep';
import { useState } from 'react';
import StorageStep from './StorageStep';
import { setAppStorage } from '@utils/Storages';

enum OnboardingStep {
  PICK_THEME,
  STORAGE_LOCATION,
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const [rootStorage, setRootStorage] = useState('');
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.PICK_THEME);
  const renderStep = () => {
    switch (step) {
      case OnboardingStep.PICK_THEME:
        return <PickThemeStep />;
      case OnboardingStep.STORAGE_LOCATION:
        return (
          <StorageStep
            rootStorage={rootStorage}
            onPathChange={setRootStorage}
          />
        );
      default:
        return <PickThemeStep />;
    }
  };
  const renderHelptext = () => {
    switch (step) {
      case OnboardingStep.PICK_THEME:
        return 'Pick a theme';
      case OnboardingStep.STORAGE_LOCATION:
        return 'Select storage for LNReader';
      default:
        return <PickThemeStep />;
    }
  };
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <Image
        source={require('../../../assets/logo.png')}
        tintColor={theme.primary}
        style={{
          width: 90,
          height: 90,
        }}
      />
      <Text
        variant="headlineLarge"
        style={{
          fontWeight: '600',
          paddingBottom: 8,
          color: theme.onBackground,
        }}
      >
        Yaholo!
      </Text>
      <Text
        style={{
          fontWeight: '600',
          paddingBottom: 8,
          color: theme.onBackground,
        }}
      >
        {renderHelptext()}
      </Text>
      <View
        style={[
          styles.stepContainer,
          { backgroundColor: theme.surfaceVariant },
        ]}
      >
        {renderStep()}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {step !== OnboardingStep.PICK_THEME ? (
          <Button
            style={{ flex: 1 }}
            title="Previous"
            mode="contained"
            onPress={() => setStep(step - 1)}
          />
        ) : null}
        {step !== OnboardingStep.STORAGE_LOCATION ? (
          <Button
            style={{ flex: 1 }}
            title="Next"
            mode="contained"
            onPress={() => setStep(step + 1)}
          />
        ) : null}
        {step === OnboardingStep.STORAGE_LOCATION && rootStorage ? (
          <Button
            style={{ flex: 1 }}
            title="Complete"
            mode="contained"
            onPress={() => {
              setAppStorage(rootStorage);
            }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  stepContainer: {
    paddingVertical: 16,
    borderRadius: 8,
  },
});
