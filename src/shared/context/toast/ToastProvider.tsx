import React, { ReactNode, useCallback, useRef, useState } from "react";
import { ToastContext, ToastMessage, ToastType, ToastPlacement } from "./ToastContext";
import Toast from "../../components/toast/Toast";
import { View, Platform, StatusBar, SafeAreaView } from "react-native";

interface ToastProviderProps {
  children: ReactNode;
  initialPlacement?: ToastPlacement;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  initialPlacement = "bottom" 
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [defaultPlacement, setDefaultPlacement] = useState<ToastPlacement>(initialPlacement);
  const toastCounter = useRef(0);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 3000, placement?: ToastPlacement) => {
      // Incrementar el contador para asegurar IDs únicos incluso si se crean en el mismo milisegundo
      toastCounter.current += 1;
      const id = `${Date.now()}-${toastCounter.current}`;
      
      const newToast: ToastMessage = {
        id,
        type,
        message,
        duration,
        placement: placement || defaultPlacement,
      };

      // Limitar el número de toasts visibles a 3 para evitar sobrecargar la UI
      setToasts((prevToasts) => {
        const updatedToasts = [...prevToasts, newToast];
        return updatedToasts.slice(-3); // Mantener solo los 3 más recientes
      });

      // Auto-hide toast after duration
      if (duration !== 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [defaultPlacement]
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Separar los toasts por placement
  const topToasts = toasts.filter(toast => toast.placement === 'top');
  const bottomToasts = toasts.filter(toast => toast.placement === 'bottom');

  return (
    <ToastContext.Provider value={{ 
      showToast, 
      hideToast, 
      clearAllToasts,
      toasts, 
      defaultPlacement, 
      setDefaultPlacement 
    }}>
      {children}
      
      {/* Top Toasts */}
      <SafeAreaView
        style={{
          position: "absolute",
          top: Platform.OS === 'ios' ? 50 : 40,
          left: 0,
          right: 0,
          zIndex: 2,
          alignItems: "center",
          pointerEvents: "box-none",
        }}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          {topToasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => hideToast(toast.id)}
              placement="top"
            />
          ))}
        </View>
      </SafeAreaView>

      {/* Bottom Toasts */}
      <SafeAreaView
        style={{
          position: "absolute",
          bottom: Platform.OS === 'ios' ? 50 : 40,
          left: 0,
          right: 0,
          zIndex: 2,
          alignItems: "center",
          pointerEvents: "box-none",
        }}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          {bottomToasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => hideToast(toast.id)}
              placement="bottom"
            />
          ))}
        </View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
};
