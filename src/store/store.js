import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "localforage";
import { combineReducers } from "redux";
import candidateReducer from "./candidateSlice"; 

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  candidates: candidateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
