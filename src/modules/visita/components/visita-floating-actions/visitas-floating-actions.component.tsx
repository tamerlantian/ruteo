import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { visitasStyles } from '../../screen/visitas/visitas.style';

interface VisitasFloatingActionsProps {
  totalSeleccionadas: number;
  onClearSelection: () => void;
  onDeliverVisitas: () => void;
  // onNovedadVisitas?: () => void; // Para futuro uso
}

export const VisitasFloatingActions: React.FC<VisitasFloatingActionsProps> = ({
  totalSeleccionadas,
  onClearSelection,
  onDeliverVisitas,
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
        <TouchableOpacity 
          style={visitasStyles.primaryActionButton}
          onPress={onDeliverVisitas}
        >
          <Text style={visitasStyles.primaryActionText}>
            Entregar ({totalSeleccionadas})
          </Text>
        </TouchableOpacity>
        
        {/* Espacio reservado para futuro botón Novedad */}
        {/* 
        {onNovedadVisitas && (
          <TouchableOpacity 
            style={visitasStyles.secondaryActionButton}
            onPress={onNovedadVisitas}
          >
            <Text style={visitasStyles.secondaryActionText}>
              Novedad ({totalSeleccionadas})
            </Text>
          </TouchableOpacity>
        )}
        */}
      </View>
    </View>
  );
};
