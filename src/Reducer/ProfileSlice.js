import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const viewProfile = createAsyncThunk(
    'viewProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/goodmood/profile');
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
)

export const updateProfile = createAsyncThunk(
    'updateProfile',
    async (input, { rejectWithValue }) => {
        try {
            const response = await api.post('/user/update-profile', input);
            if (response?.data?.status_code === 200) {
                return response.data;
            } else {
                if (response?.data?.errors) {
                    return rejectWithValue(response.data.errors);
                } else {
                    return rejectWithValue('Something went wrong.');
                }
            }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
)

const initialState = {
    loading: false,
    error: "",
    message: "",
    profileDetail: null,
    role: "",
    loadingPro: false,
}

const ProfileSlice = createSlice(
    {
        name: 'profile',
        initialState,
        reducers: {},
        extraReducers: (builder) => {
            builder
                .addCase(viewProfile.pending, (state) => {
                    state.loading = true
                })
                .addCase(viewProfile.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.profileDetail = payload.data
                    state.role = payload.role
                    state.error = ""
                    state.message = payload.message || 'Profile fetched successfully';
                })
                .addCase(viewProfile.rejected, (state, { payload }) => {
                    state.error = true;
                    state.loading = false;
                    state.message =
                        payload !== undefined && payload.message
                            ? payload.message
                            : 'Something went wrong. Try again later.';
                })

                .addCase(updateProfile.pending, (state) => {
                    state.loadingPro = true
                })
                .addCase(updateProfile.fulfilled, (state, { payload }) => {
                    state.loadingPro = false
                    state.error = ""
                    state.message =
                        payload !== undefined && payload.message
                            ? payload.message
                            : 'Something went wrong. Try again later.';
                })
                .addCase(updateProfile.rejected, (state, { payload }) => {
                    state.error = true;
                    state.loadingPro = false;
                    state.message =
                        payload !== undefined && payload.message
                            ? payload.message
                            : 'Something went wrong. Try again later.';
                })
        }
    }
)
export default ProfileSlice.reducer;