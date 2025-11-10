import { StyleSheet } from "react-native";

export const visitaCardStyle = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120, // Altura mínima, pero puede crecer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  document: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8e8e93',
  },
  subtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 6,
    marginTop: 4,
  },
  address: {
    fontSize: 11,
    color: '#007aff',
    marginBottom: 8,
    lineHeight: 14,
    flexShrink: 1, // Permite que se ajuste al contenido
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Alinea al inicio para mejor distribución
    marginTop: 6,
    flexWrap: 'wrap', // Permite que se envuelva si es necesario
  },
  leftInfo: {
    flex: 1,
  },
  infoText: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '500',
    marginBottom: 2,
  },
  cobro: {
    fontSize: 12,
    color: '#ff3b30',
    fontWeight: '600',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    flexShrink: 0, // No se encoge
    maxWidth: 120, // Ancho máximo
  },
  phoneText: {
    fontSize: 10,
    color: '#007aff',
    fontWeight: '500',
    marginLeft: 3,
    flexShrink: 1, // Puede encogerse si es necesario
  },
  containerSelected: {
    backgroundColor: '#f0f8ff', // Azul muy suave
    borderWidth: 2,
    borderColor: '#007aff',
    shadowColor: '#007aff',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkmark: {
    width: 8,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
    marginLeft: 2,
  },
})