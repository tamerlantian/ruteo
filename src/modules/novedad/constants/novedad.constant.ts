import { PhotoData } from "../../visita/interfaces/visita.interface";

export const novedadValidationRules = {
    tipo: {
      required: 'El tipo de novedad es obligatorio',
    },
    descripcion: {
      required: 'La descripción es obligatoria',
      maxLength: {
        value: 500,
        message: 'La descripción no puede exceder 500 caracteres',
      },
    },
    foto: {
      required: 'Debe agregar al menos una foto',
      validate: (value: PhotoData[]) => {
        if (!value || value.length === 0) {
          return 'Debe agregar al menos una foto';
        }
        return true;
      },
    },
  };