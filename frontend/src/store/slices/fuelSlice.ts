import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { FuelEntry } from '../../types';

interface FuelState {
    list: FuelEntry[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: FuelState = {
    list: [],
    status: 'idle',
};

export const fetchFuelEntries = createAsyncThunk('fuel/fetchEntries', async () => {
    const response = await api.get<FuelEntry[]>('/fuel');
    return response.data;
});

export const createFuelEntry = createAsyncThunk('fuel/createEntry', async (entry: Partial<FuelEntry>) => {
    const response = await api.post<FuelEntry>('/fuel', entry);
    return response.data;
});

export const deleteFuelEntry = createAsyncThunk('fuel/deleteEntry', async (id: number) => {
    await api.delete(`/fuel/${id}`);
    return id;
});

const fuelSlice = createSlice({
    name: 'fuel',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFuelEntries.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFuelEntries.fulfilled, (state, action: PayloadAction<FuelEntry[]>) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(createFuelEntry.fulfilled, (state, action: PayloadAction<FuelEntry>) => {
                state.list.push(action.payload);
            })
            .addCase(deleteFuelEntry.fulfilled, (state, action: PayloadAction<number>) => {
                state.list = state.list.filter(e => e.id !== action.payload);
            });
    },
});

export default fuelSlice.reducer;
