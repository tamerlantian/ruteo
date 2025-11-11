import { StyleSheet } from 'react-native';

export const novedadFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    padding: 20,
  },
  visitasInfo: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  visitasInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
    marginBottom: 12,
  },
  visitasScrollContainer: {
    maxHeight: 50,
  },
  visitasIds: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  visitaId: {
    backgroundColor: '#007aff',
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
});
