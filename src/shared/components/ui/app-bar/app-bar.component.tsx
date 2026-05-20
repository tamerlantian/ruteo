import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { authColors } from '../../../../modules/auth/styles/auth.theme';

/**
 * Altura fija del area de contenido del AppBar. El subtitulo no la cambia —
 * la tipografia esta dimensionada para entrar en este alto sin reflow.
 * 52pt esta entre el estandar Material (56dp) e iOS (44pt), apropiado para
 * una app movil de productividad.
 */
const APPBAR_CONTENT_HEIGHT = 52;
const ACTION_HIT_SIZE = 40; // WCAG-friendly touch target

interface AppBarProps {
  /** Texto principal (left-aligned). */
  title: string;
  /** Linea secundaria opcional (ej. estado contextual). */
  subtitle?: string;
  /** Slot izquierdo: back, menu, logo. Las pantallas raiz de tab no lo usan. */
  leading?: React.ReactNode;
  /** Slot derecho: una o varias `AppBarAction`. */
  actions?: React.ReactNode;
  /**
   * `default` -> fondo blanco + separador hairline inferior (pantallas raiz).
   * `transparent` -> sin fondo ni borde (cuando el AppBar va sobre un hero
   *                  con su propio color de fondo).
   */
  variant?: 'default' | 'transparent';
  /** Override puntual del estilo del contenedor (raro, evitarlo). */
  style?: ViewStyle;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  leading,
  actions,
  variant = 'default',
  style,
}) => {
  return (
    <View
      style={[
        styles.bar,
        variant === 'default' && styles.barDefault,
        variant === 'transparent' && styles.barTransparent,
        style,
      ]}
      accessibilityRole="header"
    >
      {leading && <View style={styles.leading}>{leading}</View>}

      <View style={[styles.titleBlock, !leading && styles.titleBlockNoLeading]}>
        <Text style={styles.title} numberOfLines={1} allowFontScaling>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1} allowFontScaling>
            {subtitle}
          </Text>
        )}
      </View>

      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
};

interface AppBarActionProps {
  icon: string;
  onPress: () => void;
  /** Accesibilidad: que lee el screen reader al enfocar la accion. */
  label: string;
  /** Contador opcional (1-99). 0 oculta el badge. */
  badge?: number;
  /** Override del color del icono. Default `ink`. */
  color?: string;
  disabled?: boolean;
}

/**
 * Boton de accion del AppBar. Estandariza tamaño de touch (40x40 + hitSlop),
 * tipografia del badge y semantica de accesibilidad. Los callers no deben
 * armar su propio TouchableOpacity + Ionicons — siempre usar este.
 */
export const AppBarAction: React.FC<AppBarActionProps> = ({
  icon,
  onPress,
  label,
  badge,
  color = authColors.ink,
  disabled = false,
}) => {
  const verBadge = !!badge && badge > 0;
  return (
    <TouchableOpacity
      style={[styles.action, disabled && styles.actionDisabled]}
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
    >
      <Ionicons name={icon as any} size={22} color={color} />
      {verBadge && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    minHeight: APPBAR_CONTENT_HEIGHT,
  },
  barDefault: {
    backgroundColor: authColors.field,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.border,
  },
  barTransparent: {
    backgroundColor: 'transparent',
  },
  leading: {
    width: ACTION_HIT_SIZE,
    height: ACTION_HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 4,
  },
  titleBlockNoLeading: {
    // Sin leading dejamos un poco mas de aire a la izquierda — alineado
    // con el padding general (20px) que usan los contenidos de las screens.
    paddingLeft: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: authColors.ink,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: authColors.inkSoft,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    width: ACTION_HIT_SIZE,
    height: ACTION_HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: authColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: authColors.field,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
    lineHeight: 12,
  },
});
