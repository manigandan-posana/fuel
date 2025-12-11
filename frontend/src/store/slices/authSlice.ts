import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../services/api';
import type { User } from '../../types/';

interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Load token and user from localStorage on initialization
const savedToken = localStorage.getItem('authToken');
const savedUser = localStorage.getItem('authUser');

const initialState: AuthState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,
    status: savedToken ? 'succeeded' : 'idle',
    error: null,
};

// Set token in axios if it exists
if (savedToken) {
    setAuthToken(savedToken);
}

export const syncUser = createAsyncThunk('auth/syncUser', async (token: string, { rejectWithValue }) => {
    try {
        setAuthToken(token);
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        console.log('Calling /auth/me with token:', token.substring(0, 20) + '...');
        const response = await api.get<User>('/auth/me');
        console.log('User sync successful:', response.data);
        // Store user in localStorage
        localStorage.setItem('authUser', JSON.stringify(response.data));
        return { user: response.data, token };
    } catch (error: any) {
        console.error('User sync failed:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        // Clear stored data on error
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        return rejectWithValue(error.response?.data || error.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            setAuthToken('');
            // Clear localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
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
            .addCase(syncUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Authentication failed';
                console.error('syncUser rejected with error:', action.payload);
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
