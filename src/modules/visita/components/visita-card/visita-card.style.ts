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
    height: 120, // Altura fija para getItemLayout
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#007aff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8e8e93',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  weight: {
    fontSize: 12,
    color: '#007aff',
    fontWeight: '500',
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