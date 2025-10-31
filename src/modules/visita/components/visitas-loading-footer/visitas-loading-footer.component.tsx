import React from 'react';
import { View, Text } from 'react-native';
import { visitasStyles } from '../../screen/visitas/visitas.style';

interface VisitasLoadingFooterProps {
  isLoading: boolean;
}

export const VisitasLoadingFooter: React.FC<VisitasLoadingFooterProps> = ({
  isLoading,
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <View style={visitasStyles.loadingFooter}>
      <Text style={visitasStyles.loadingText}>Cargando más visitas...</Text>
    </View>
  );
};
