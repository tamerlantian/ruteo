import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPlacement = "top" | "bottom";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  placement?: ToastPlacement;
}

export interface ToastContextProps {
  showToast: (type: ToastType, message: string, duration?: number, placement?: ToastPlacement) => void;
  hideToast: (id: string) => void;
  toasts: ToastMessage[];
  defaultPlacement: ToastPlacement;
  setDefaultPlacement: (placement: ToastPlacement) => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(
  undefined
);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
