import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getAllTransactions = createAsyncThunk(
    'getAllTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/transaction/list`);
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

export const searchTransactions = createAsyncThunk(
    'searchTransactions',
    async (query, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/transaction/search?query=${query}`);
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

export const toggleIsPaid = createAsyncThunk(
    'toggleIsPaid',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`goodmood/transaction/toggle-paid/${id}`);
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
    transactionHistory: [],
};

const TransactionHistorySlice = createSlice({
    name: "transactionHistory",
    initialState,
    reducers: {
        clearTransactionMessage: (state) => {
            state.message = "";
            state.error = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllTransactions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.transactionHistory = payload.data;
                state.message = payload.message;
            })
            .addCase(getAllTransactions.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Something went wrong. Try again later.';
            })
            .addCase(searchTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchTransactions.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.transactionHistory = payload.data;
                state.message = payload.message;
            })
            .addCase(searchTransactions.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Search failed. Try again later.';
            })
            .addCase(toggleIsPaid.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleIsPaid.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = false;
                state.message = payload.message;
                // Update the specific transaction in the list
                const index = state.transactionHistory.findIndex(t => t.id === payload.data.id);
                if (index !== -1) {
                    state.transactionHistory[index] = payload.data;
                }
            })
            .addCase(toggleIsPaid.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = true;
                state.message = payload?.message || 'Toggle failed. Try again later.';
            });
    }
});

export const { clearTransactionMessage } = TransactionHistorySlice.actions;
export default TransactionHistorySlice.reducer;
