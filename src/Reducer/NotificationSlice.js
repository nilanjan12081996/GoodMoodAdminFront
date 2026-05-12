import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../store/Api';

export const fetchUnreadCounts = createAsyncThunk(
  'notifications/fetchUnreadCounts',
  async () => {
    const types = ['APPOINTMENT', 'USER_REGISTRATION', 'DOCTOR_REGISTRATION', 'PAYMENT'];
    const counts = {
      APPOINTMENT: 0,
      USER_REGISTRATION: 0,
      DOCTOR_REGISTRATION: 0,
      PAYMENT: 0
    };
    
    // Fetch all types in parallel
    const promises = types.map(type => 
      api.get(`/goodmood/notifications/type/${type}`)
        .then(res => ({ type, data: res.data }))
        .catch(() => ({ type, data: { status: false } }))
    );

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result.data.status && Array.isArray(result.data.data)) {
        counts[result.type] = result.data.data.filter(n => !n.isRead).length;
      }
    });

    return counts;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCounts: {
      APPOINTMENT: 0,
      USER_REGISTRATION: 0,
      DOCTOR_REGISTRATION: 0,
      PAYMENT: 0
    },
    loading: false
  },
  reducers: {
    updateCount: (state, action) => {
      const { type, count } = action.payload;
      if (state.unreadCounts.hasOwnProperty(type)) {
        state.unreadCounts[type] = count;
      }
    },
    decrementCount: (state, action) => {
      const { type } = action.payload;
      if (state.unreadCounts[type] > 0) {
        state.unreadCounts[type] -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.unreadCounts = action.payload;
        state.loading = false;
      })
      .addCase(fetchUnreadCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnreadCounts.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { updateCount, decrementCount } = notificationSlice.actions;
export default notificationSlice.reducer;
