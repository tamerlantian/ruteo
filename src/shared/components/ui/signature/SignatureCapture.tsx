import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Ionicons from '@react-native-vector-icons/ionicons';
import { signatureCaptureStyles } from './SignatureCapture.style';

interface SignatureCaptureProps {
  onSignatureCapture: (signature: string) => void;
  onSignatureClear?: () => void;
  onScrollEnable?: (enabled: boolean) => void;
  navigation?: any; // Navigation object para controlar gestos del modal
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
}

/**
 * Componente de captura de firmas digitales
 * Captura automática de la firma cuando el usuario termina de firmar
 */
export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureCapture,
  onSignatureClear,
  onScrollEnable,
  navigation,
  width = 300,
  height = 200,
  penColor = '#000000',
  backgroundColor = '#ffffff',
}) => {
  const [hasSignature, setHasSignature] = useState(false);
  const [completed, setCompleted] = useState(false);
  const signatureRef = useRef<any>(null);

  // === HANDLERS ===
  
  const handleOK = (signature: string) => {
    onSignatureCapture(signature);
    setCompleted(true);
  };

  const handleEmpty = () => {
    Alert.alert('Firma Vacía', 'Por favor, proporcione una firma antes de guardar.');
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
    setHasSignature(false);
    setCompleted(false);
    onSignatureClear?.();

    // Asegurar que los gestos del modal estén habilitados al limpiar
    if (navigation) {
      navigation.setOptions({
        gestureEnabled: true,
        gestureResponseDistance: undefined,
      });
    }
  };

  const handleBegin = () => {
    // Usuario comenzó a firmar - deshabilitar scroll Y gesto del modal
    onScrollEnable?.(false);

    // Deshabilitar completamente los gestos del modal para evitar movimientos visuales
    if (navigation) {
      navigation.setOptions({
        gestureEnabled: false,
        gestureResponseDistance: 0, // Elimina completamente la respuesta al gesto
      });
    }
  };

  const handleEnd = () => {
    // Usuario terminó de firmar - habilitar scroll y capturar firma automáticamente
    setHasSignature(true);
    onScrollEnable?.(true);

    // Rehabilitar completamente los gestos del modal
    if (navigation) {
      navigation.setOptions({
        gestureEnabled: true,
        gestureResponseDistance: undefined, // Restaurar valor por defecto
      });
    }

    // Capturar firma automáticamente al terminar de firmar
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  };

  // Configuración del canvas de firma
  const signatureStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      padding: 0;
    }
  `;

  return (
    <View style={signatureCaptureStyles.container}>
      {/* Header */}
      <View style={signatureCaptureStyles.header}>
        {/* <Text style={signatureCaptureStyles.title}>Firma Digital</Text> */}
        {completed && (
          <View style={signatureCaptureStyles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34c759" />
            <Text style={signatureCaptureStyles.statusText}>Firmado</Text>
          </View>
        )}
      </View>

      {/* Canvas de firma */}
      <View style={[signatureCaptureStyles.canvasContainer, { width, height }]}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          onBegin={handleBegin}
          onEnd={handleEnd}
          descriptionText="Firme aquí"
          clearText="Limpiar"
          confirmText="Confirmar"
          webStyle={signatureStyle}
          autoClear={false}
          imageType="image/png"
          dataURL=""
          penColor={penColor}
          backgroundColor={backgroundColor}
          minWidth={1}
          maxWidth={3}
          trimWhitespace={true}
        />
        
        {/* Overlay de placeholder cuando está vacío */}
        {!hasSignature && (
          <View style={signatureCaptureStyles.placeholderOverlay}>
            <Ionicons name="create-outline" size={32} color="#8e8e93" />
            <Text style={signatureCaptureStyles.placeholderText}>
              Firme en el recuadro
            </Text>
          </View>
        )}

        {/* Overlay para bloquear interacción cuando la firma está completada */}
        {completed && (
          <View style={signatureCaptureStyles.disabledOverlay} />
        )}
      </View>

      {/* Controles */}
      <View style={signatureCaptureStyles.controls}>
        <TouchableOpacity
          style={[
            signatureCaptureStyles.controlButton,
            signatureCaptureStyles.clearButton,
          ]}
          onPress={handleClear}
        >
          <Ionicons name="refresh-outline" size={20} color="#ff3b30" />
          <Text style={signatureCaptureStyles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
