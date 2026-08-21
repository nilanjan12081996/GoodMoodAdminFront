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
      console.log("Raw Support Total:", response?.data);
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
      console.log("Raw Support Category:", response?.data);
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
      console.log("Raw User Counts:", response?.data);
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
      console.log("Raw Total Appointments:", response?.data);
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ======================================================
// FETCH APPOINTMENTS BY SPECIFIC DATE
// ======================================================
export const getAppointmentsByDate = createAsyncThunk(
  'analytics/getAppointmentsByDate',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`goodmood/appointments/list?date=${date}`);
      console.log("Raw Appointments By Date:", response?.data);
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
    clearAppointmentsByDate: (state) => {
      state.appointmentsByDate = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Total Support Requests
      .addCase(getTotalSupportRequests.fulfilled, (state, { payload }) => {
        state.totalSupportRequests = payload;
      })
      // Support Requests by Category
      .addCase(getSupportRequestsByCategory.fulfilled, (state, { payload }) => {
        state.supportRequestsByCategory = Array.isArray(payload) 
          ? payload 
          : (payload?.categories || []);
      })
      // User Counts
      .addCase(getUserCounts.fulfilled, (state, { payload }) => {
        state.userCounts = payload;
      })
      // Total Appointments
      .addCase(getTotalAppointments.fulfilled, (state, { payload }) => {
        state.totalAppointments = payload;
      })
      // Appointments By Specific Date
      .addCase(getAppointmentsByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByDate.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.appointmentsByDate = Array.isArray(payload) ? payload : [];
      })
      .addCase(getAppointmentsByDate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearAppointmentsByDate } = AnalyticsAndReportsSlice.actions;
export default AnalyticsAndReportsSlice.reducer;