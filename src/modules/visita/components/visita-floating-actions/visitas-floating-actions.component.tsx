import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { visitasStyles } from '../../screen/visitas/visitas.style';
import { FilterType } from '../filter-badges/filter-badges.component';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';

interface VisitasFloatingActionsProps {
  totalSeleccionadas: number;
  totalConError?: number;
  activeFilter: FilterType;
  isRetryLoading?: boolean;
  onClearSelection: () => void;
  onDeliverVisitas: () => void;
  onRetryVisitas?: () => void;
  // onNovedadVisitas?: () => void; // Para futuro uso
}

export const VisitasFloatingActions: React.FC<VisitasFloatingActionsProps> = ({
  totalSeleccionadas,
  totalConError = 0,
  activeFilter,
  isRetryLoading = false,
  onClearSelection,
  onDeliverVisitas,
  onRetryVisitas,
  // onNovedadVisitas,
}) => {
  if (totalSeleccionadas === 0) {
    return null;
  }

  return (
    <View style={visitasStyles.floatingActionBar}>
      <TouchableOpacity 
        style={visitasStyles.clearSelectionButton}
        onPress={onClearSelection}
      >
        <Text style={visitasStyles.clearSelectionText}>✕</Text>
      </TouchableOpacity>
      
      <View style={visitasStyles.actionButtonsContainer}>
        {/* Mostrar botón según el filtro activo y disponibilidad de datos */}
        {activeFilter === 'error' && totalConError > 0 && onRetryVisitas ? (
          <FormButton
            title={isRetryLoading ? 'Reintentando...' : `Reintentar (${totalConError})`}
            onPress={onRetryVisitas}
            style={visitasStyles.secondaryActionButton}
            isLoading={isRetryLoading}
            disabled={isRetryLoading}
          />
        ) : (
          <TouchableOpacity 
            style={visitasStyles.primaryActionButton}
            onPress={onDeliverVisitas}
          >
            <Text style={visitasStyles.primaryActionText}>
              Entregar ({totalSeleccionadas})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
