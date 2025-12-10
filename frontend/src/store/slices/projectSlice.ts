import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Project } from '../../types';

interface ProjectState {
    list: Project[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProjectState = {
    list: [],
    status: 'idle',
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
});

export const createProject = createAsyncThunk('projects/createProject', async (project: Partial<Project>) => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
});

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.list.push(action.payload);
            });
    },
});

export default projectSlice.reducer;
