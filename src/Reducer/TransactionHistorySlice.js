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
            });
    }
});

export const { clearTransactionMessage } = TransactionHistorySlice.actions;
export default TransactionHistorySlice.reducer;
