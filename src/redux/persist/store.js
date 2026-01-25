import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import rootReducer from "../reducers/rootReducer";

const persistConfig = {
    key: 'root',
    storage: AsyncStorage
}

const persistedRootReducers = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedRootReducers,
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({
            immutableCheck: false,  // disable ImmutableStateInvariantMiddleware
            serializableCheck: false, // optional: disable SerializableStateInvariantMiddleware
        })
    ]
})

export const persistor = persistStore(store)