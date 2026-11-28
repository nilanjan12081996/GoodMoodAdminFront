import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getAllDoctorTransactionTotals = createAsyncThunk(
    "getAllDoctorTransactionTotals",
    async (filters = {}, { rejectWithValue }) => {
        try {
            const { startDate, endDate, month, year } = filters;
            const queryParams = [];
            if (startDate) queryParams.push(`startDate=${startDate}`);
            if (endDate) queryParams.push(`endDate=${endDate}`);
            if (month) queryParams.push(`month=${month}`);
            if (year) queryParams.push(`year=${year}`);

            const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
            const response = await api.get(`goodmood/doctor-transaction/total/all${queryString}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getDoctorTransactionTotal = createAsyncThunk(
    "getDoctorTransactionTotal",
    async ({ doctorId, filters = {} }, { rejectWithValue }) => {
        try {
            const { startDate, endDate, month, year } = filters;
            const queryParams = [];
            if (startDate) queryParams.push(`startDate=${startDate}`);
            if (endDate) queryParams.push(`endDate=${endDate}`);
            if (month) queryParams.push(`month=${month}`);
            if (year) queryParams.push(`year=${year}`);

            const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
            const response = await api.get(`goodmood/doctor-transaction/total/${doctorId}${queryString}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const settleSingleDoctor = createAsyncThunk(
    "settleSingleDoctor",
    async ({ doctorId, mode = "MANUAL", utr = "", includeOnHold = false, transactionIds = null }, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/doctor-transaction/settle/doctor/${doctorId}`, {
                mode,
                utr,
                includeOnHold,
                transactionIds,
            });
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const settleBatchDoctors = createAsyncThunk(
    "settleBatchDoctors",
    async ({ mode = "MANUAL", utrPrefix = "", doctorIds = null }, { rejectWithValue }) => {
        try {
            const response = await api.post("goodmood/doctor-transaction/settle/batch", {
                mode,
                utrPrefix,
                doctorIds,
            });
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const getSettlementSettings = createAsyncThunk(
    "getSettlementSettings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("goodmood/doctor-transaction/settings");
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const saveSettlementSettings = createAsyncThunk(
    "saveSettlementSettings",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post("goodmood/doctor-transaction/settings", payload);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

const initialState = {
    loading: false,
    settling: false,
    settingsLoading: false,
    error: false,
    message: "",
    doctorTotals: [],
    selectedDoctorTotal: null,
    settlementSettings: {
        autoSettlementEnabled: false,
        autoSettlementTime: "22:00",
        defaultPayoutMode: "MANUAL",
        razorpayRefundConfigured: false,
        razorpayXPayoutConfigured: false,
        lastAutoRunDate: "",
        lastAutoRunSummary: "",
    },
};

const DoctorTransactionSlice = createSlice({
    name: "doctorTransaction",
    initialState,
    reducers: {
        clearDoctorTransactionMessage: (state) => {
            state.message = "";
            state.error = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDoctorTransactionTotals.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllDoctorTransactionTotals.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.doctorTotals = payload.data || [];
            })
            .addCase(getAllDoctorTransactionTotals.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Failed to fetch doctor settlements";
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
                state.message = payload?.message || "Failed to fetch doctor total";
            })
            .addCase(settleSingleDoctor.pending, (state) => {
                state.settling = true;
            })
            .addCase(settleSingleDoctor.fulfilled, (state, { payload }) => {
                state.settling = false;
                state.error = false;
                state.message = payload?.message || "Expert payout settled successfully";
            })
            .addCase(settleSingleDoctor.rejected, (state, { payload }) => {
                state.settling = false;
                state.error = true;
                state.message = payload?.message || "Expert settlement failed";
            })
            .addCase(settleBatchDoctors.pending, (state) => {
                state.settling = true;
            })
            .addCase(settleBatchDoctors.fulfilled, (state, { payload }) => {
                state.settling = false;
                state.error = false;
                state.message = payload?.message || "Batch settlement completed";
            })
            .addCase(settleBatchDoctors.rejected, (state, { payload }) => {
                state.settling = false;
                state.error = true;
                state.message = payload?.message || "Batch settlement failed";
            })
            .addCase(getSettlementSettings.fulfilled, (state, { payload }) => {
                if (payload?.data) {
                    state.settlementSettings = payload.data;
                }
            })
            .addCase(saveSettlementSettings.pending, (state) => {
                state.settingsLoading = true;
            })
            .addCase(saveSettlementSettings.fulfilled, (state, { payload }) => {
                state.settingsLoading = false;
                state.error = false;
                if (payload?.data) {
                    state.settlementSettings = payload.data;
                }
                state.message = payload?.message || "Settlement settings updated";
            })
            .addCase(saveSettlementSettings.rejected, (state, { payload }) => {
                state.settingsLoading = false;
                state.error = true;
                state.message = payload?.message || "Failed to save settings";
            });
    },
});

export const { clearDoctorTransactionMessage } = DoctorTransactionSlice.actions;
export default DoctorTransactionSlice.reducer;
