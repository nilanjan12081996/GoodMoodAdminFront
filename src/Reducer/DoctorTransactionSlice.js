import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getAllDoctorTransactionTotals = createAsyncThunk(
    'getAllDoctorTransactionTotals',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const { startDate, endDate, month, year } = filters;
            let queryParams = [];
            if (startDate) queryParams.push(`startDate=${startDate}`);
            if (endDate) queryParams.push(`endDate=${endDate}`);
            if (month) queryParams.push(`month=${month}`);
            if (year) queryParams.push(`year=${year}`);
            
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const response = await api.get(`goodmood/doctor-transaction/total/all${queryString}`);
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

export const getDoctorTransactionTotal = createAsyncThunk(
    'getDoctorTransactionTotal',
    async ({ doctorId, filters = {} }, { rejectWithValue }) => {
        try {
            const { startDate, endDate, month, year } = filters;
            let queryParams = [];
            if (startDate) queryParams.push(`startDate=${startDate}`);
            if (endDate) queryParams.push(`endDate=${endDate}`);
            if (month) queryParams.push(`month=${month}`);
            if (year) queryParams.push(`year=${year}`);
            
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const response = await api.get(`goodmood/doctor-transaction/total/${doctorId}${queryString}`);
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
    doctorTotals: [],
    selectedDoctorTotal: null
};

const DoctorTransactionSlice = createSlice({
    name: "doctorTransaction",
    initialState,
    reducers: {
        clearDoctorTransactionMessage: (state) => {
            state.message = "";
            state.error = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDoctorTransactionTotals.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllDoctorTransactionTotals.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.doctorTotals = payload.data;
            })
            .addCase(getAllDoctorTransactionTotals.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Failed to fetch doctor totals';
            })
            .addCase(getDoctorTransactionTotal.pending, (state) => {
                state.loading = true;
            })
            .addCase(getDoctorTransactionTotal.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.selectedDoctorTotal = payload.data;
            })
            .addCase(getDoctorTransactionTotal.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Failed to fetch doctor total';
            });
    }
});

export const { clearDoctorTransactionMessage } = DoctorTransactionSlice.actions;
export default DoctorTransactionSlice.reducer;
