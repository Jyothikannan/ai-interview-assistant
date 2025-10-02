// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import localForage from "localforage"; // use consistent naming
import candidateReducer from "./candidateSlice"; 

// Configure persistence
const persistConfig = {
  key: "root",
  storage: localForage, // use localForage for IndexedDB storage
  whitelist: ["candidates"], // persist only candidates slice
};

const rootReducer = combineReducers({
  candidates: candidateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  //  disable serializable check for redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
