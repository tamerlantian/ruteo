import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppInfoService from '../../../shared/services/app-info.service';
import { aboutStyles } from '../styles/about.style';

export const AboutScreen = () => {
  const appVersion = AppInfoService.getVersion();
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView style={aboutStyles.container}>
      <ScrollView style={aboutStyles.scrollContainer}>
        {/* App Info */}
        <View style={aboutStyles.appInfoContainer}>
          <View style={aboutStyles.appIcon}>
            <Text style={aboutStyles.appIconText}>R</Text>
          </View>
          
          <Text style={aboutStyles.appName}>Ruteo.co</Text>
          <Text style={aboutStyles.appVersion}>Versión {appVersion}</Text>
          <Text style={aboutStyles.appDescription}>
            Aplicación para gestión de entregas y visitas
          </Text>
        </View>

        {/* Company Info */}
        <View style={aboutStyles.sectionContainer}>
          <Text style={aboutStyles.sectionTitle}>Información</Text>
          
          <View style={aboutStyles.infoContainer}>
            <View style={aboutStyles.infoItem}>
              <Text style={aboutStyles.infoLabel}>Desarrollado por</Text>
              <Text style={aboutStyles.infoValue}>Semántica</Text>
            </View>
            
            <View style={aboutStyles.infoItem}>
              <Text style={aboutStyles.infoLabel}>Año</Text>
              <Text style={aboutStyles.infoValue}>{currentYear}</Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={aboutStyles.copyrightContainer}>
          <Text style={aboutStyles.copyrightText}>
            © {currentYear} Semántica. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
