import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const createToastStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginVertical: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      maxWidth: width * 0.9,
      minWidth: width * 0.8,
      marginHorizontal: 16,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    success: {
      backgroundColor: 'rgba(52, 199, 89, 0.95)', // Verde más moderno con transparencia
    },
    error: {
      backgroundColor: 'rgba(255, 59, 48, 0.95)', // Rojo más moderno con transparencia
    },
    info: {
      backgroundColor: 'rgba(0, 122, 255, 0.95)', // Azul más moderno con transparencia
    },
    warning: {
      backgroundColor: 'rgba(255, 149, 0, 0.95)', // Naranja más moderno con transparencia
    },
    message: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
      marginLeft: 10,
      lineHeight: 18,
    },
    closeButton: {
      padding: 4,
      marginLeft: 8,
      borderRadius: 20,
    },
    iconContainer: {
      marginRight: 4,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
