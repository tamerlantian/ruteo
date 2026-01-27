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
        {activeFilter === 'errores' && totalSeleccionadas > 0 && onAnularVisitas ? (
          // Filtro "Errores" - mostrar solo botón Anular
          <FormButton
            title={`Anular (${totalSeleccionadas})`}
            onPress={onAnularVisitas}
            style={visitasStyles.flexButton}
            isLoading={isRetryLoading}
            variant='danger'
          />
        ) : activeFilter === 'error' && totalConError > 0 && onRetryVisitas ? (
          // Filtro "Sincronizar" - mostrar botón Reintentar para errores retryables
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
