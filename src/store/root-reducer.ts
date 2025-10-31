import { combineReducers } from "@reduxjs/toolkit";
import visitaReducer from "../modules/visita/store/slice/visita.slice";

const rootReducer = combineReducers({
  visita: visitaReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
