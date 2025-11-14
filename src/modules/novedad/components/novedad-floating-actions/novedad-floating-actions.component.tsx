import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { novedadesStyles } from '../../screen/novedades/novedades.style';

type NovedadFilterType = 'all' | 'error';

interface NovedadFloatingActionsProps {
  totalSeleccionadas: number;
  totalConError?: number;
  activeFilter: NovedadFilterType;
  isRetryLoading?: boolean;
  onClearSelection: () => void;
  onSolucionarNovedades: () => void;
  onRetryNovedades?: () => void;
}

export const NovedadFloatingActions: React.FC<NovedadFloatingActionsProps> = ({
  totalSeleccionadas,
  totalConError = 0,
  activeFilter,
  isRetryLoading = false,
  onClearSelection,
  onSolucionarNovedades,
  onRetryNovedades,
}) => {
  if (totalSeleccionadas === 0) {
    return null;
  }

  return (
    <View style={novedadesStyles.floatingActionBar}>
      <TouchableOpacity 
        style={novedadesStyles.clearSelectionButton}
        onPress={onClearSelection}
        disabled={isRetryLoading}
      >
        <Text style={novedadesStyles.clearSelectionText}>✕</Text>
      </TouchableOpacity>
      
      <View style={novedadesStyles.actionButtonsContainer}>
        {/* Mostrar botón según el filtro activo y disponibilidad de datos */}
        {activeFilter === 'error' && totalConError > 0 && onRetryNovedades ? (
          <FormButton
            title={`Reintentar (${totalConError})`}
            onPress={onRetryNovedades}
            style={{ flex: 1 }}
            isLoading={isRetryLoading}
            variant='success'
          />
        ) : (
          <FormButton 
            title={`Solucionar (${totalSeleccionadas})`}
            onPress={onSolucionarNovedades}
            isLoading={isRetryLoading}
            style={{ flex: 1 }}
            variant='primary'
          />
        )}
      </View>
    </View>
  );
};
