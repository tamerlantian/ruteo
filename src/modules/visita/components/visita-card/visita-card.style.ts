import { StyleSheet } from "react-native";

export const visitaCardStyle = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 120,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberBadge: {
    backgroundColor: '#4698f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  destinatarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    marginTop: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  document: {
    fontSize: 11,
    fontWeight: '500',
    color: '#646467ff',
  },
  subtitle: {
    fontSize: 14,
    color: '#676769ff',
    flex: 1,
  },
  address: {
    fontSize: 12,
    color: '#007aff',
    lineHeight: 14,
    flexShrink: 1,
    flex: 1,
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
    justifyContent: 'center',
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 11,
    color: '#646467ff',
    fontWeight: '500',
  },
  cobroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cobro: {
    fontSize: 14,
    marginLeft: 16,
    color: '#ff3b30',
    fontWeight: '800',
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