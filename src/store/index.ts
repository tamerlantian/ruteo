import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import {
    createMigrate,
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist";
import rootReducer from "./root-reducer";

/**
 * Migraciones del persisted state. autoMergeLevel1 sobreescribe el slice
 * completo en cada rehydrate, asi que los campos NUEVOS de un slice no se
 * inicializan a partir del initialState — necesitan migracion explicita.
 */
const migrations = {
  // v2: visita y novedad slices ganaron `snapshotsByDespacho` para la
  // memoria por orden. Inicializamos vacio en el estado persistido viejo.
  2: (state: any) => {
    if (!state) {
      return state;
    }
    return {
      ...state,
      visita: state.visita
        ? { ...state.visita, snapshotsByDespacho: state.visita.snapshotsByDespacho ?? {} }
        : state.visita,
      novedad: state.novedad
        ? { ...state.novedad, snapshotsByDespacho: state.novedad.snapshotsByDespacho ?? {} }
        : state.novedad,
    };
  },
};

const persistConfig = {
  key: "root",
  version: 2,
  storage: AsyncStorage,
  timeout: 0,
  migrate: createMigrate(migrations as any, { debug: false }),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
