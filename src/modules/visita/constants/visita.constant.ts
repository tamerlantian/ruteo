import { PhotoData } from '../../../shared/components/ui/photo-capture/PhotoCapture.types';

export const parentescos = [
  { value: 'ABUELO_A', label: 'ABUELO/A' },
  { value: 'AMIGO_A', label: 'AMIGO/A' },
  { value: 'CUIDADOR_A', label: 'CUIDADOR/A' },
  { value: 'CUNADO_A', label: 'CUÑADO/A' },
  { value: 'EMPLADO_A', label: 'EMPLADO/A' },
  { value: 'ENCARGADO_A', label: 'ENCARGADO/A' },
  { value: 'ENFERMERO_A', label: 'ENFERMERO/A' },
  { value: 'HERMANO_A', label: 'HERMANO/A' },
  { value: 'HIJO_A', label: 'HIJO/A' },
  { value: 'MADRE_SUSTITUTA', label: 'MADRE SUSTITUTA' },
  { value: 'MAMA', label: 'MAMÁ' },
  { value: 'MEDICO_A', label: 'MEDICO/A' },
  { value: 'NIETO_A', label: 'NIETO/A' },
  { value: 'NUERA', label: 'NUERA' },
  { value: 'PADRE_SUSTITUTO', label: 'PADRE SUSTITUTO' },
  { value: 'PAPA', label: 'PAPÁ' },
  { value: 'PAREJA', label: 'PAREJA' },
  { value: 'PRIMO_A', label: 'PRIMO/A' },
  { value: 'REGENTE', label: 'REGENTE' },
  { value: 'SOBRINO_A', label: 'SOBRINO/A' },
  { value: 'SUEGRO_A', label: 'SUEGRO/A' },
  { value: 'TIO_A', label: 'TÍO/A' },
  { value: 'TITULAR', label: 'TITULAR' },
  { value: 'VECINO_A', label: 'VECINO/A' },
  { value: 'VIGILANTE', label: 'VIGILANTE' },
  { value: 'YERNO', label: 'YERNO' },
];

export const LIST_OPTIMIZATION_CONFIG = {
  // Removed ITEM_HEIGHT since cards now have dynamic height
  INITIAL_NUM_TO_RENDER: 10,
  MAX_TO_RENDER_PER_BATCH: 5,
  WINDOW_SIZE: 10,
  UPDATE_CELLS_BATCHING_PERIOD: 50,
} as const;

export const visitaFormValidationRules = {
  recibe: {
    minLength: {
      value: 2,
      message: 'El nombre debe tener al menos 2 caracteres',
    },
    maxLength: {
      value: 100,
      message: 'El nombre no puede exceder 100 caracteres',
    },
  },
  numeroIdentificacion: {
    minLength: {
      value: 6,
      message: 'El número de identificación debe tener al menos 6 caracteres',
    },
    maxLength: {
      value: 20,
      message: 'El número de identificación no puede exceder 20 caracteres',
    },
    pattern: {
      value: /^[0-9]+$/,
      message: 'El número de identificación solo puede contener números',
    },
  },
  celular: {
    minLength: {
      value: 7,
      message: 'El número de celular debe tener al menos 7 dígitos',
    },
    maxLength: {
      value: 15,
      message: 'El número de celular no puede exceder 15 dígitos',
    },
    pattern: {
      value: /^[0-9+\-\s()]+$/,
      message: 'Formato de número de celular inválido',
    },
  },
  firma: {
    validate: (value: string) => {
      // Si no hay firma, es válido (campo opcional)
      if (!value || value.trim() === '') {
        return true;
      }

      // Si hay firma, validar que sea un base64 válido
      if (!value.startsWith('data:image/') && !value.includes('base64')) {
        return 'Formato de firma inválido';
      }

      return true;
    },
  },
  parentesco: {
    validate: (value: string) => {
      // Si no hay parentesco, es válido (campo opcional)
      if (!value || value.trim() === '') {
        return true;
      }

      // Validar que el valor esté en la lista de opciones válidas
      const validValues = parentescos.map(p => p.value);
      if (!validValues.includes(value)) {
        return 'Seleccione un parentesco válido';
      }

      return true;
    },
  },
  fotos: {
    validate: (value: PhotoData[]) => {
      // Si no hay fotos, es válido (campo opcional)
      if (!value || value.length === 0) {
        return true;
      }

      if (value.length > 5) {
        return 'No puedes agregar más de 5 fotos';
      }

      return true;
    },
  },
};
