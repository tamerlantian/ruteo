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
  hasNonRetryableSelected?: boolean;
  totalNonRetryableSelected?: number;
  onClearSelection: () => void;
  onDeliverVisitas: () => void;
  onRetryVisitas?: () => void;
  onNovedadVisitas?: () => void;
  onAnularVisitas?: () => void;
  onSelectAllErrors?: () => void;
  totalErrorsInFilter?: number;
}

export const VisitasFloatingActions: React.FC<VisitasFloatingActionsProps> = ({
  totalSeleccionadas,
  totalConError = 0,
  activeFilter,
  isRetryLoading = false,
  hasNonRetryableSelected = false,
  totalNonRetryableSelected = 0,
  onClearSelection,
  onDeliverVisitas,
  onRetryVisitas,
  onNovedadVisitas,
  onAnularVisitas,
  onSelectAllErrors,
  totalErrorsInFilter = 0,
}) => {
  // Mostrar botón de "Seleccionar todos" cuando no hay selecciones y estamos en filtro error
  if (totalSeleccionadas === 0) {
    if (activeFilter === 'error' && totalErrorsInFilter > 0 && onSelectAllErrors) {
      return (
        <View style={visitasStyles.floatingActionBar}>
          <TouchableOpacity 
            style={visitasStyles.selectAllButton}
            onPress={onSelectAllErrors}
            disabled={isRetryLoading}
          >
            <Text style={visitasStyles.selectAllText}>
              Seleccionar todos ({totalErrorsInFilter})
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={visitasStyles.floatingActionBar}>
      <TouchableOpacity 
        style={visitasStyles.clearSelectionButton}
        onPress={onClearSelection}
        disabled={isRetryLoading}
      >
        <Text style={visitasStyles.clearSelectionText}>✕</Text>
      </TouchableOpacity>
      
      <View style={visitasStyles.actionButtonsContainer}>
        {/* Mostrar botón según el filtro activo y disponibilidad de datos */}
        {hasNonRetryableSelected && onAnularVisitas ? (
          // Cuando hay visitas no-retryables seleccionadas, mostrar solo botón Anular
          <FormButton
            title={`Anular (${totalNonRetryableSelected})`}
            onPress={onAnularVisitas}
            style={visitasStyles.flexButton}
            isLoading={isRetryLoading}
            variant='danger'
          />
        ) : activeFilter === 'error' && totalConError > 0 && onRetryVisitas ? (
          // Filtro error con visitas retryables
          <FormButton
            title={`Reintentar (${totalConError})`}
            onPress={onRetryVisitas}
            style={visitasStyles.flexButton}
            isLoading={isRetryLoading}
            variant='success'
          />
        ) : (
          // Caso normal: entregar y novedad
          <>
            <FormButton 
              title={`Entregar (${totalSeleccionadas})`}
              onPress={onDeliverVisitas}
              style={visitasStyles.flexButtonWithMargin}
              variant='success'
            />
            {onNovedadVisitas && (
              <FormButton 
                title="Novedad"
                onPress={onNovedadVisitas}
                style={visitasStyles.flexButtonSmall}
                variant='secondary'
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};
