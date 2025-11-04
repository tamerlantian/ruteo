import { PhotoData } from "../../../shared/components/ui/photo-capture/PhotoCapture.types";

export const LIST_OPTIMIZATION_CONFIG = {
  ITEM_HEIGHT: 120,
  INITIAL_NUM_TO_RENDER: 10,
  MAX_TO_RENDER_PER_BATCH: 5,
  WINDOW_SIZE: 10,
  UPDATE_CELLS_BATCHING_PERIOD: 50,
} as const;

export const visitaFormValidationRules = {
  recibe: {
    minLength: {
      value: 2,
      message: 'El nombre debe tener al menos 2 caracteres'
    },
    maxLength: {
      value: 100,
      message: 'El nombre no puede exceder 100 caracteres'
    }
  },
  numeroIdentificacion: {
    minLength: {
      value: 6,
      message: 'El número de identificación debe tener al menos 6 caracteres'
    },
    maxLength: {
      value: 20,
      message: 'El número de identificación no puede exceder 20 caracteres'
    },
    pattern: {
      value: /^[0-9]+$/,
      message: 'El número de identificación solo puede contener números'
    }
  },
  celular: {
    minLength: {
      value: 10,
      message: 'El número de celular debe tener al menos 10 dígitos'
    },
    maxLength: {
      value: 15,
      message: 'El número de celular no puede exceder 15 dígitos'
    },
    pattern: {
      value: /^[0-9+\-\s()]+$/,
      message: 'Formato de número de celular inválido'
    }
  },
  firma: {
    validate: (value: string) => {
      console.log('Validating signature:', value ? `${value.substring(0, 50)}... (length: ${value.length})` : 'empty');
      
      // Si no hay firma, es válido (campo opcional)
      if (!value || value.trim() === '') {
        console.log('No signature provided - valid (optional field)');
        return true;
      }
      
      // Si hay firma, validar que sea un base64 válido
      if (!value.startsWith('data:image/') && !value.includes('base64')) {
        console.log('Invalid signature format:', value.substring(0, 100));
        return 'Formato de firma inválido';
      }
      
      console.log('Signature validation passed');
      return true;
    }
  },
  fotos: {
    validate: (value: PhotoData[]) => {
      console.log('Validating photos:', value ? value.length : 0, 'photos');
      
      // Si no hay fotos, es válido (campo opcional)
      if (!value || value.length === 0) {
        console.log('No photos provided - valid (optional field)');
        return true;
      }
      
      if (value.length > 5) {
        return 'No puedes agregar más de 5 fotos';
      }
      
      console.log('Photos validation passed');
      return true;
    }
  }
};