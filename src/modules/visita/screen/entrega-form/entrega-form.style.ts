import { StyleSheet } from 'react-native';

export const entregaFormStyles = StyleSheet.create({
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
  content: {
    flex: 1,
    padding: 20,
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
  debugContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxWidth: 300,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
    marginBottom: 8,
  },
  debugItem: {
    fontSize: 12,
    color: '#007aff',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8e8e93',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#34c759',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#c7c7cc',
  },
  submitButtonTextDisabled: {
    color: '#8e8e93',
  },
  // Nuevos estilos para el formulario
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007aff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  visitasInfo: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  visitasInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
    marginBottom: 12,
  },
  visitasIds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  visitaIdMore: {
    backgroundColor: '#8e8e93',
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  // Estilos para el campo de firma
  signatureFieldContainer: {
    marginBottom: 24,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  requiredAsterisk: {
    color: '#ff3b30',
  },
  signatureError: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
  },
  signatureHelper: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
    lineHeight: 16,
  },
  // Estilos para el campo de fotos
  photoFieldContainer: {
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  photoError: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 8,
  },
  photoHelper: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
    lineHeight: 16,
  },
});
