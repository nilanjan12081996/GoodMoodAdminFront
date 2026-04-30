import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getRoles = createAsyncThunk(
    'getRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/goodmood/roles/list');
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                return rejectWithValue(response?.data?.message || 'Something went wrong.');
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Something went wrong.');
        }
    }
)

export const createRole = createAsyncThunk(
    'createRole',
    async (roleData, { rejectWithValue }) => {
        try {
            const response = await api.post('/goodmood/roles/create', roleData);
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                return rejectWithValue(response?.data?.message || 'Something went wrong.');
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Something went wrong.');
        }
    }
)

const initialState = {
    loading: false,
    roleData: null,
    error: false,
    createLoading: false,
    createSuccess: false
}

const RoleSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {
        resetCreateState: (state) => {
            state.createLoading = false;
            state.createSuccess = false;
            state.error = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRoles.pending, (state) => {
                state.loading = true
            })
            .addCase(getRoles.fulfilled, (state, { payload }) => {
                state.loading = false
                state.roleData = payload
                state.error = false
            })
            .addCase(getRoles.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload
            })
            .addCase(createRole.pending, (state) => {
                state.createLoading = true
            })
            .addCase(createRole.fulfilled, (state) => {
                state.createLoading = false
                state.createSuccess = true
                state.error = false
            })
            .addCase(createRole.rejected, (state, { payload }) => {
                state.createLoading = false
                state.createSuccess = false
                state.error = payload
            })
    }
})

export const { resetCreateState } = RoleSlice.actions;
export default RoleSlice.reducer;
