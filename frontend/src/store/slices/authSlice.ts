import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../services/api';
import { User } from '../../types';

interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
    user: null,
    token: null,
    status: 'idle',
};

export const syncUser = createAsyncThunk('auth/syncUser', async (token: string) => {
    setAuthToken(token);
    const response = await api.get<User>('/auth/me');
    return { user: response.data, token };
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            setAuthToken('');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(syncUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(syncUser.fulfilled, (state, action: PayloadAction<{ user: User, token: string }>) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(syncUser.rejected, (state) => {
                state.status = 'failed';
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
