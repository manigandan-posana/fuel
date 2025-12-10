import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Vehicle } from '../../types';

interface VehicleState {
    list: Vehicle[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: VehicleState = {
    list: [],
    status: 'idle',
};

export const fetchVehicles = createAsyncThunk('vehicles/fetchVehicles', async () => {
    const response = await api.get<Vehicle[]>('/vehicles');
    return response.data;
});

export const createVehicle = createAsyncThunk('vehicles/createVehicle', async (vehicle: Partial<Vehicle>) => {
    const response = await api.post<Vehicle>('/vehicles', vehicle);
    return response.data;
});

export const deleteVehicle = createAsyncThunk('vehicles/deleteVehicle', async (id: number) => {
    await api.delete(`/vehicles/${id}`);
    return id;
});

const vehicleSlice = createSlice({
    name: 'vehicles',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(createVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
                state.list.push(action.payload);
            })
            .addCase(deleteVehicle.fulfilled, (state, action: PayloadAction<number>) => {
                state.list = state.list.filter(v => v.id !== action.payload);
            });
    },
});

export default vehicleSlice.reducer;
