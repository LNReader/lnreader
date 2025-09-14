import { StyleSheet } from 'react-native';

/**
 * Shared styles for dynamic settings components to reduce redundancy
 */
export const sharedStyles = StyleSheet.create({
  // Common padding styles
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  paddingVertical: {
    paddingVertical: 12,
  },

  // Common flex styles
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexRowReverse: {
    flexDirection: 'row-reverse',
  },

  // Common margin styles
  marginVertical: {
    marginVertical: 8,
  },
  marginHorizontal: {
    marginHorizontal: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },

  // Common text styles
  fontSize16: {
    fontSize: 16,
  },
  fontSize14: {
    fontSize: 14,
  },

  // Common container styles
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flexGrow: 1,
  },

  // Common button styles
  button: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // Common input styles
  input: {
    width: 50,
    height: 46,
    textAlignVertical: 'center',
  },

  // Common modal styles
  modalContainer: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 28,
  },
  modalHeader: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 10,
  },
});
