import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getProfile = createAsyncThunk(
    'getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('goodmood/profile');
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateProfileName = createAsyncThunk(
    'updateProfileName',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.put('goodmood/profile/update-name', user_input);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const changePassword = createAsyncThunk(
    'changePassword',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.put('goodmood/profile/change-password', user_input);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const initialState = {
    loading: false,
    passwordLoading: false,
    profileDetail: null,
    role: null,
    error: false,
    successMessage: "",
};

const ProfileSlice = createSlice({
    name: 'profileData',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.error = false;
            state.successMessage = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Profile
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(getProfile.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.profileDetail = payload?.data;
                state.role = payload?.role;
                state.error = false;
            })
            .addCase(getProfile.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            // Update Profile Name
            .addCase(updateProfileName.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.successMessage = "";
            })
            .addCase(updateProfileName.fulfilled, (state, { payload }) => {
                state.loading = false;
                const updatedData = payload?.data || payload?.["Updated user"];
                if (state.profileDetail && updatedData) {
                    if (updatedData.firstName) state.profileDetail.firstName = updatedData.firstName;
                    if (updatedData.lastName) state.profileDetail.lastName = updatedData.lastName;
                }
                state.successMessage = payload?.message || "Name updated successfully";
                state.error = false;
            })
            .addCase(updateProfileName.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.passwordLoading = true;
                state.error = false;
                state.successMessage = "";
            })
            .addCase(changePassword.fulfilled, (state, { payload }) => {
                state.passwordLoading = false;
                state.successMessage = payload?.message || "Password changed successfully";
                state.error = false;
            })
            .addCase(changePassword.rejected, (state, { payload }) => {
                state.passwordLoading = false;
                state.error = payload;
            });
    },
});

export const { clearMessages } = ProfileSlice.actions;
export default ProfileSlice.reducer;