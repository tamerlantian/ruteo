import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Ionicons from '@react-native-vector-icons/ionicons';
import { signatureCaptureStyles } from './SignatureCapture.style';

interface SignatureCaptureProps {
  onSignatureCapture: (signature: string) => void;
  onSignatureClear?: () => void;
  onScrollEnable?: (enabled: boolean) => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
}

/**
 * Componente de captura de firmas digitales
 * Captura automática al terminar de firmar con opción manual
 */
export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureCapture,
  onSignatureClear,
  onScrollEnable,
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
  };

  const handleBegin = () => {
    // Usuario comenzó a firmar - deshabilitar scroll
    onScrollEnable?.(false);
  };

  const handleEnd = () => {
    // Usuario terminó de firmar - habilitar scroll y capturar firma automáticamente
    setHasSignature(true);
    onScrollEnable?.(true);
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

        {hasSignature && !completed && (
          <TouchableOpacity
            style={[
              signatureCaptureStyles.controlButton,
              signatureCaptureStyles.saveButton,
            ]}
            onPress={() => {
              if (signatureRef.current) {
                signatureRef.current.readSignature();
              }
            }}
          >
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
            <Text style={signatureCaptureStyles.saveButtonText}>Confirmar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
