import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Vehicle } from '../../types';

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
            });
    },
});

export default vehicleSlice.reducer;
