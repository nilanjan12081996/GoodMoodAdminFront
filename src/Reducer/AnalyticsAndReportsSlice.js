import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

// ======================================================
// FETCH TOTAL SUPPORT REQUESTS
// ======================================================
export const getTotalSupportRequests = createAsyncThunk(
  'analytics/getTotalSupportRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/appointments/dashboard/support-requests/total');
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ======================================================
// FETCH SUPPORT REQUESTS BY CATEGORY
// ======================================================
export const getSupportRequestsByCategory = createAsyncThunk(
  'analytics/getSupportRequestsByCategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/appointments/dashboard/support-requests/by-category');
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ======================================================
// FETCH USER COUNTS
// ======================================================
export const getUserCounts = createAsyncThunk(
  'analytics/getUserCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/users/count');
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ======================================================
// FETCH TOTAL APPOINTMENTS
// ======================================================
export const getTotalAppointments = createAsyncThunk(
  'analytics/getTotalAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('goodmood/appointments/dashboard/totalAppoinment');
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ======================================================
// FETCH APPOINTMENTS BY DATE RANGE
// ======================================================
export const getAppointmentsByDateRange = createAsyncThunk(
  'analytics/getAppointmentsByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `goodmood/appointments/list?startDate=${startDate}&endDate=${endDate}`
      );
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  loading: false,
  error: null,
  totalSupportRequests: 0,
  supportRequestsByCategory: [],
  userCounts: { total: 0, active: 0 },
  totalAppointments: 0,
  appointmentsByDate: [],
};

// ======================================================
// SLICE DEFINITION
// ======================================================
const AnalyticsAndReportsSlice = createSlice({
  name: 'analyticsAndReports',
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.appointmentsByDate = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTotalSupportRequests.fulfilled, (state, { payload }) => {
        state.totalSupportRequests = payload;
      })
      .addCase(getSupportRequestsByCategory.fulfilled, (state, { payload }) => {
        state.supportRequestsByCategory = Array.isArray(payload) 
          ? payload 
          : (payload?.categories || []);
      })
      .addCase(getUserCounts.fulfilled, (state, { payload }) => {
        state.userCounts = payload;
      })
      .addCase(getTotalAppointments.fulfilled, (state, { payload }) => {
        state.totalAppointments = payload;
      })
      // Appointments by Date Range
      .addCase(getAppointmentsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByDateRange.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.appointmentsByDate = Array.isArray(payload) ? payload : [];
      })
      .addCase(getAppointmentsByDateRange.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearAppointments } = AnalyticsAndReportsSlice.actions;
export default AnalyticsAndReportsSlice.reducer;