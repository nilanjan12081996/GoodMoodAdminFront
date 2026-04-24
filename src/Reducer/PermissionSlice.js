import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getAdminPermissions = createAsyncThunk(
    'permissions/getAdminPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/permissions/my-sidebar-access`);
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    loading: false,
    error: false,
    message: "",
    userPermissions: [],
};

const PermissionSlice = createSlice({
    name: "permissions",
    initialState,
    reducers: {
        clearPermissionMessage: (state) => {
            state.message = "";
            state.error = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAdminPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAdminPermissions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.userPermissions = payload.data;
                state.error = false;
            })
            .addCase(getAdminPermissions.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to fetch permissions";
            });
    }
});

export const { clearPermissionMessage } = PermissionSlice.actions;
export default PermissionSlice.reducer;
