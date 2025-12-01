import React from 'react';
import { useAppSelector } from '../../../../store/hooks';
import { 
  selectPuedeDesvincular, 
  selectConteoVisitasQueImpidenDesvinculacion 
} from '../../store/selector/visita.selector';
import { ConfirmacionDesvincularComponent } from './confirmacion-desvincular.component';

/**
 * Ejemplo de uso del componente ConfirmacionDesvincular con validación
 * 
 * Este ejemplo muestra cómo integrar el componente con los selectores
 * para validar si se puede desvincular una orden según el estado de las visitas.
 */
export const EjemploUsoConfirmacionDesvincular: React.FC = () => {
  // Selectores para validación
  const puedeDesvincular = useAppSelector(selectPuedeDesvincular);
  const conteoVisitas = useAppSelector(selectConteoVisitasQueImpidenDesvinculacion);

  const handleConfirmar = () => {
    if (puedeDesvincular) {
      // Lógica para desvincular la orden
      console.log('Desvinculando orden...');
      // Aquí iría la lógica real de desvinculación
    }
  };

  const handleCancelar = () => {
    // Lógica para cancelar
    console.log('Cancelando desvinculación');
  };

  return (
    <ConfirmacionDesvincularComponent
      onConfirmar={handleConfirmar}
      onCancelar={handleCancelar}
      puedeDesvincular={puedeDesvincular}
      conteoVisitas={conteoVisitas}
      isLoading={false}
    />
  );
};

/**
 * Casos de uso cubiertos:
 * 
 * 1. Sin visitas ni novedades con errores:
 *    - Muestra mensaje normal de confirmación
 *    - Botón "Desvincular" habilitado
 * 
 * 2. Con visitas con error:
 *    - Muestra mensaje específico con conteo de visitas con error
 *    - Botón "No disponible" deshabilitado
 *    - Mensaje de advertencia visible
 * 
 * 3. Con novedades con error:
 *    - Muestra mensaje específico con conteo de novedades con error
 *    - Botón "No disponible" deshabilitado
 *    - Mensaje de advertencia visible
 * 
 * 4. Con ambos tipos de errores:
 *    - Muestra mensaje combinado con ambos conteos
 *    - Botón "No disponible" deshabilitado
 *    - Mensaje de advertencia visible
 */
