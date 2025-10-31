export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Visitas: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  HomeTabs: undefined;
  EntregaForm: {
    visitasSeleccionadas: string[]; // Array de IDs de visitas seleccionadas
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
