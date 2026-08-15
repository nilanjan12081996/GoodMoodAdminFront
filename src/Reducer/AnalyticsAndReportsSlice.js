import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getTotalSupportRequests = createAsyncThunk(
  'analytics/getTotalSupportRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/appointments/dashboard/support-requests/total');
      console.log("Raw Support Total:", response?.data);
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getSupportRequestsByCategory = createAsyncThunk(
  'analytics/getSupportRequestsByCategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/appointments/dashboard/support-requests/by-category');
      console.log("Raw Support Category:", response?.data);
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserCounts = createAsyncThunk(
  'analytics/getUserCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/users/count');
      console.log("Raw User Counts:", response?.data);
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getTotalAppointments = createAsyncThunk(
  'analytics/getTotalAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/appointments/dashboard/totalAppoinment');
      console.log("Raw Total Appointments:", response?.data);
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  totalSupportRequests: 0,
  supportRequestsByCategory: [],
  userCounts: { total: 0, active: 0 },
  totalAppointments: 0,
};

const AnalyticsAndReportsSlice = createSlice({
  name: 'analyticsAndReports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTotalSupportRequests.fulfilled, (state, { payload }) => {
        state.totalSupportRequests = payload;
      })
      .addCase(getSupportRequestsByCategory.fulfilled, (state, { payload }) => {
        state.supportRequestsByCategory = Array.isArray(payload) ? payload : (payload?.categories || []);
      })
      .addCase(getUserCounts.fulfilled, (state, { payload }) => {
        state.userCounts = payload;
      })
      .addCase(getTotalAppointments.fulfilled, (state, { payload }) => {
        state.totalAppointments = payload;
      });
  },
});

export default AnalyticsAndReportsSlice.reducer;