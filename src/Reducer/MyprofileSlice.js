import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

// ======================================================
// VIEW PROFILE
// ======================================================

export const viewProfile = createAsyncThunk(
  "profile/viewProfile",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`goodmood/profile`);

      if (response?.data?.statusCode === 200) {
        return response.data;
      }

      return rejectWithValue(
        response?.data || "Failed to fetch profile details"
      );
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {
  loading: false,

  profileDetail: null,

  role: null,

  error: null,
};

// ======================================================
// SLICE
// ======================================================

const ProfileSlice = createSlice({
  name: "profile",

  initialState,

  reducers: {
    clearProfileState: (state) => {
      state.loading = false;
      state.profileDetail = null;
      state.role = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ==================================================
    // VIEW PROFILE
    // ==================================================

    builder
      .addCase(viewProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(viewProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileDetail = action.payload?.data || null;
        state.role = action.payload?.role || null;
        state.error = null;
      })

      .addCase(viewProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileState } = ProfileSlice.actions;

export default ProfileSlice.reducer;