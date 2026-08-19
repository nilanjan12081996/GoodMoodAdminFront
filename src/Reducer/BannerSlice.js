import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios"; // Direct import bypasses api.js interceptor
import api from "../store/Api"; // Used for standard GET requests

export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("goodmood/banners/all");
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// Upload banner using standard axios to bypass api.js header forced JSON
export const addBanner = createAsyncThunk(
  "banner/addBanner",
  async (formDataPayload, { rejectWithValue }) => {
    try {
      const tokenData = JSON.parse(sessionStorage.getItem("good_mood_admin_token") || "{}");
      const token = tokenData?.token;
      const domain = window.location.origin;

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}goodmood/banners/add`,
        formDataPayload,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Domain: domain,
            // Do NOT set Content-Type; Axios sets boundary automatically for FormData
          },
        }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  message: "",
  bannerList: [],
};

const BannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearBannerState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(payload)) state.bannerList = payload;
        else if (Array.isArray(payload?.data)) state.bannerList = payload.data;
        else if (Array.isArray(payload?.result)) state.bannerList = payload.result;
        else state.bannerList = [];
      })
      .addCase(fetchBanners.rejected, (state, { payload }) => {
        state.error = true;
        state.loading = false;
        state.message = typeof payload === "string" ? payload : payload?.message || "Failed to fetch banners.";
      })

      // Add Banner
      .addCase(addBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBanner.fulfilled, (state) => {
        state.loading = false;
        state.message = "Banner created successfully!";
        state.error = null;
      })
      .addCase(addBanner.rejected, (state, { payload }) => {
        state.error = true;
        state.loading = false;
        
        // Extract field-specific messages if backend sends a 422 errors object
        if (payload?.errors && typeof payload.errors === "object") {
          const firstKey = Object.keys(payload.errors)[0];
          const errorVal = payload.errors[firstKey];
          state.message = Array.isArray(errorVal) ? errorVal[0] : errorVal;
        } else {
          state.message = typeof payload === "string" ? payload : payload?.message || "Validation failed.";
        }
      });
  },
});

export const { clearBannerState } = BannerSlice.actions;
export default BannerSlice.reducer;