import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

export type OrderVista = 'entregas' | 'mapa' | 'novedades';

interface OrderBottomNavProps {
  active: OrderVista;
  onChange: (vista: OrderVista) => void;
  novedadesCount?: number;
}

interface Item {
  key: OrderVista;
  label: string;
  icon: string;
  iconActive: string;
}

const ITEMS: Item[] = [
  { key: 'entregas', label: 'Entregas', icon: 'cube-outline', iconActive: 'cube' },
  { key: 'mapa', label: 'Mapa', icon: 'map-outline', iconActive: 'map' },
  {
    key: 'novedades',
    label: 'Novedades',
    icon: 'alert-circle-outline',
    iconActive: 'alert-circle',
  },
];

const ACTIVE = '#0E7BB0';
const INACTIVE = '#8E8E93';

/**
 * Barra de navegación INTERNA de la orden: separa las 3 intenciones de trabajo
 * (entregas / mapa / novedades). No es un navegador de React Navigation — es un
 * switch de vista local del detalle. La barra de tabs global queda oculta
 * mientras el detalle está en primer plano, así que no se apilan dos barras.
 */
export const OrderBottomNav: React.FC<OrderBottomNavProps> = ({
  active,
  onChange,
  novedadesCount = 0,
}) => {
  return (
    <View style={styles.bar}>
      {ITEMS.map(item => {
        const isActive = active === item.key;
        const color = isActive ? ACTIVE : INACTIVE;
        const verBadge = item.key === 'novedades' && novedadesCount > 0;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => onChange(item.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
          >
            <View>
              <Ionicons
                name={(isActive ? item.iconActive : item.icon) as any}
                size={23}
                color={color}
              />
              {verBadge && (
                <View style={styles.badge} pointerEvents="none">
                  <Text style={styles.badgeText}>
                    {novedadesCount > 99 ? '99+' : novedadesCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
