import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/context/auth.context';
import { FormButton } from '../../../shared/components/ui/button/FormButton';
import { useAppSelector } from '../../../store/hooks';
import { 
  selectVisitasPendientes, 
  selectVisitasEntregadas, 
  selectVisitasConError 
} from '../../visita/store/selector/visita.selector';

export const DashboardScreen = () => {
  const { user, logout } = useAuth();
  
  // Selectores para obtener estadísticas de visitas
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasEntregadas = useAppSelector(selectVisitasEntregadas);
  const visitasConError = useAppSelector(selectVisitasConError);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión? Se eliminarán todos los datos locales.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        
        {user && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              ¡Hola, {user.nombre || user.username}!
            </Text>
            <Text style={styles.subtitleText}>
              Bienvenido a tu panel principal
            </Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.pendingNumber]}>{visitasPendientes.length}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.completedNumber]}>{visitasEntregadas.length}</Text>
            <Text style={styles.statLabel}>Entregadas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.errorNumber]}>{visitasConError.length}</Text>
            <Text style={styles.statLabel}>Con Error</Text>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <FormButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  welcomeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 4,
  },
  pendingNumber: {
    color: '#ff9500', // Naranja para pendientes
  },
  completedNumber: {
    color: '#34c759', // Verde para entregadas
  },
  errorNumber: {
    color: '#ff3b30', // Rojo para errores
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  logoutContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
