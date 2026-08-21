import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../store/Api";

// Fetch All Banners
export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/goodmood/banners/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch banners");
    }
  }
);

// Fetch Single Banner by ID
export const fetchBannerById = createAsyncThunk(
  "banner/fetchBannerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/goodmood/banners/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch banner details");
    }
  }
);

// Add Banner
export const addBanner = createAsyncThunk(
  "banner/addBanner",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/goodmood/banners/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: [
          (data, headers) => {
            if (headers) {
              delete headers["Content-Type"];
              delete headers["content-type"];
            }
            return data;
          },
        ],
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add banner");
    }
  }
);

// Update Banner
export const updateBanner = createAsyncThunk(
  "banner/updateBanner",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/goodmood/banners/update/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: [
          (data, headers) => {
            if (headers) {
              delete headers["Content-Type"];
              delete headers["content-type"];
            }
            return data;
          },
        ],
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update banner");
    }
  }
);

// Toggle Banner Status
export const toggleBannerStatus = createAsyncThunk(
  "banner/toggleBannerStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/goodmood/banners/toggle-status/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to toggle status");
    }
  }
);

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    bannerList: [],
    currentBanner: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.bannerList = action.payload?.data || action.payload || [];
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Banner By ID
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.currentBanner = action.payload;
      })
      // Add Banner
      .addCase(addBanner.fulfilled, (state) => {
        state.loading = false;
      })
      // Update Banner
      .addCase(updateBanner.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearCurrentBanner } = bannerSlice.actions;
export default bannerSlice.reducer;