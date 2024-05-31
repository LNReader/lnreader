import { useTheme } from '@hooks/persisted';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, View } from 'react-native';
import { Button } from '@components';
import PickThemeStep from './PickThemeStep';
import { useState } from 'react';
import StorageStep from './StorageStep';

enum OnboardingStep {
  PICK_THEME,
  STORAGE_LOCATION,
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.PICK_THEME);
  const renderStep = () => {
    switch (step) {
      case OnboardingStep.PICK_THEME:
        return <PickThemeStep />;
      case OnboardingStep.STORAGE_LOCATION:
        return <StorageStep />;
      default:
        return <PickThemeStep />;
    }
  };
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <Image
        source={require('../../../assets/logo.png')}
        tintColor={theme.onBackground}
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
          color: theme.primary,
        }}
      >
        Yaholo!
      </Text>
      <Text
        style={{
          fontWeight: '500',
          paddingBottom: 8,
          color: theme.onBackground,
        }}
      >
        Let's set some things up first.
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
