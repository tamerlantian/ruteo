import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {Button} from '../../components';
import {Screen} from '../../navigation/AppNavigator';

interface HomeScreenProps {
  onLogout: () => void;
  navigate: (screen: Screen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({onLogout}) => {
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleFeature = (featureName: string) => {
    Alert.alert(
      featureName,
      `Funcionalidad "${featureName}" no implementada aún`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Hola!</Text>
        <Text style={styles.subtitle}>Bienvenido a tu dashboard</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <View style={styles.buttonGrid}>
          <Button
            title="Perfil"
            onPress={() => handleFeature('Perfil')}
            variant="primary"
            style={styles.gridButton}
          />
          
          <Button
            title="Configuración"
            onPress={() => handleFeature('Configuración')}
            variant="secondary"
            style={styles.gridButton}
          />
          
          <Button
            title="Notificaciones"
            onPress={() => handleFeature('Notificaciones')}
            variant="outline"
            style={styles.gridButton}
          />
          
          <Button
            title="Ayuda"
            onPress={() => handleFeature('Ayuda')}
            variant="outline"
            style={styles.gridButton}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Tareas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridButton: {
    width: '48%',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  logoutSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    borderColor: '#FF3B30',
  },
});
