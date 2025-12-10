import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import fuelReducer from './slices/fuelSlice';
import projectReducer from './slices/projectSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        vehicles: vehicleReducer,
        fuel: fuelReducer,
        projects: projectReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
