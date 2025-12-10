import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { FuelEntry } from '../../types';

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
            });
    },
});

export default fuelSlice.reducer;
