import { initialWindowMetrics } from 'react-native-safe-area-context';

export default function getInitialInsets() {
  const metrics = initialWindowMetrics;
  let insets;
  if (!metrics) {
    insets = {
      top: 20,
      bottom: 40,
      left: 0,
      right: 0,
    };
  } else {
    insets = metrics.insets;
  }
  return insets;
}
