import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getAllTransactions = createAsyncThunk(
    "getAllTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("goodmood/transaction/list");
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchTransactions = createAsyncThunk(
    "searchTransactions",
    async (query, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/transaction/search?query=${encodeURIComponent(query)}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const toggleIsPaid = createAsyncThunk(
    "toggleIsPaid",
    async (payload, { rejectWithValue }) => {
        try {
            const id = typeof payload === "object" ? payload.id : payload;
            const utr = typeof payload === "object" ? payload.utr : undefined;
            const mode = typeof payload === "object" ? payload.mode : undefined;
            const body = {};
            if (utr) body.utr = utr;
            if (mode) body.mode = mode;
            const response = await api.put(`goodmood/transaction/toggle-paid/${id}`, body);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            }
            return rejectWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const refundTransaction = createAsyncThunk(
    "refundTransaction",
    async ({ id, reason, mode = "RAZORPAY", manualRef = "" }, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/transaction/refund/${id}`, {
                reason,
                mode,
                manualRef,
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

export const markSessionComplete = createAsyncThunk(
    "markSessionComplete",
    async (appointmentId, { rejectWithValue }) => {
        try {
            const response = await api.put(`goodmood/transaction/mark-session-complete/${appointmentId}`);
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
    actionLoading: false,
    error: false,
    message: "",
    transactionHistory: [],
};

const TransactionHistorySlice = createSlice({
    name: "transactionHistory",
    initialState,
    reducers: {
        clearTransactionMessage: (state) => {
            state.message = "";
            state.error = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllTransactions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.transactionHistory = payload.data || [];
            })
            .addCase(getAllTransactions.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Could not load transactions.";
            })
            .addCase(searchTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchTransactions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.transactionHistory = payload.data || [];
            })
            .addCase(searchTransactions.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || "Search failed.";
            })
            .addCase(toggleIsPaid.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(toggleIsPaid.fulfilled, (state, { payload }) => {
                state.actionLoading = false;
                state.error = false;
                state.message = payload.message || "Settlement updated";
                const index = state.transactionHistory.findIndex((t) => t.id === payload.data?.id);
                if (index !== -1) {
                    state.transactionHistory[index] = payload.data;
                }
            })
            .addCase(toggleIsPaid.rejected, (state, { payload }) => {
                state.actionLoading = false;
                state.error = true;
                state.message = payload?.message || "Settlement update failed.";
            })
            .addCase(refundTransaction.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(refundTransaction.fulfilled, (state, { payload }) => {
                state.actionLoading = false;
                state.error = false;
                state.message = payload.message || "Customer refund processed successfully";
                const index = state.transactionHistory.findIndex((t) => t.id === payload.data?.id);
                if (index !== -1) {
                    state.transactionHistory[index] = payload.data;
                }
            })
            .addCase(refundTransaction.rejected, (state, { payload }) => {
                state.actionLoading = false;
                state.error = true;
                state.message = payload?.message || "Refund failed.";
            })
            .addCase(markSessionComplete.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(markSessionComplete.fulfilled, (state, { payload }) => {
                state.actionLoading = false;
                state.error = false;
                state.message = payload.message || "Session marked as completed";
                const index = state.transactionHistory.findIndex((t) => t.id === payload.data?.id);
                if (index !== -1) {
                    state.transactionHistory[index] = payload.data;
                }
            })
            .addCase(markSessionComplete.rejected, (state, { payload }) => {
                state.actionLoading = false;
                state.error = true;
                state.message = payload?.message || "Could not mark session complete.";
            });
    },
});

export const { clearTransactionMessage } = TransactionHistorySlice.actions;
export default TransactionHistorySlice.reducer;
