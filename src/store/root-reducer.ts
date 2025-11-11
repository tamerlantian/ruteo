import { combineReducers } from "@reduxjs/toolkit";
import visitaReducer from "../modules/visita/store/slice/visita.slice";
import settingsReducer from "../modules/settings/store/slice/settings.slice";
import novedadReducer from "../modules/novedad/store/slice/novedad.slice";

const rootReducer = combineReducers({
  visita: visitaReducer,
  settings: settingsReducer,
  novedad: novedadReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
