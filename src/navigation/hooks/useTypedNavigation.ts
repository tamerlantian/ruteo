import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { 
  RootStackParamList, 
  AuthStackParamList, 
  MainStackParamList,
  MainTabParamList 
} from '../types';

/**
 * Hook tipado para navegación desde Auth Stack
 */
export type AuthNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const useAuthNavigation = () => {
  return useNavigation<AuthNavigationProp>();
};

/**
 * Hook tipado para navegación desde Main Stack
 */
export type MainNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const useMainNavigation = () => {
  return useNavigation<MainNavigationProp>();
};

/**
 * Hook tipado para navegación desde Main Tabs
 */
export type TabNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainTabParamList>,
  CompositeNavigationProp<
    NativeStackNavigationProp<MainStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export const useTabNavigation = () => {
  return useNavigation<TabNavigationProp>();
};

/**
 * Hook genérico para navegación root
 */
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useRootNavigation = () => {
  return useNavigation<RootNavigationProp>();
};
