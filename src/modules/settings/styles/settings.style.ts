import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  optionButtonWithBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '400',
  },
  optionTextDanger: {
    flex: 1,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '400',
  },
  chevronIcon: {
    // No additional styles needed, will be applied inline
  },
});
