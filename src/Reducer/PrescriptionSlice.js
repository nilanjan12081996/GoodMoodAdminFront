import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getPrescriptionBody = createAsyncThunk(
    'getPrescriptionBody',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/prescription-body`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const savePrescriptionBody = createAsyncThunk(
    'savePrescriptionBody',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/prescription-body/save`, data);
            if (response?.data?.statusCode === 200) {
                return response?.data;
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
    prescriptionData: null,
};

const PrescriptionSlice = createSlice({
    name: "prescription",
    initialState,
    reducers: {
        clearPrescriptionMessage: (state) => {
            state.message = "";
            state.error = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPrescriptionBody.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPrescriptionBody.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.prescriptionData = payload.data;
            })
            .addCase(getPrescriptionBody.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Failed to fetch prescription body';
            })
            .addCase(savePrescriptionBody.pending, (state) => {
                state.loading = true;
            })
            .addCase(savePrescriptionBody.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.prescriptionData = payload.data;
                state.message = payload.message;
            })
            .addCase(savePrescriptionBody.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Failed to save prescription body';
            });
    }
});

export const { clearPrescriptionMessage } = PrescriptionSlice.actions;
export default PrescriptionSlice.reducer;
