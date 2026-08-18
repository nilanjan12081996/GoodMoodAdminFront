import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

// Get all master sidebars
export const fetchMasterSidebars = createAsyncThunk(
  "sidebar/fetchMasterSidebars",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("goodmood/sidebar/list");
      
      // Accept response if HTTP status is 200 or custom status_code is 200, or if data exists directly
      if (
        response?.status === 200 || 
        response?.data?.status_code === 200 || 
        response?.data
      ) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.errors || "Something went wrong.");
      }
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

// Create sub sidebar
export const createSubSidebar = createAsyncThunk(
  "sidebar/createSubSidebar",
  async (userInput, { rejectWithValue }) => {
    try {
      const response = await api.post("goodmood/sidebar/sub-sidebar-create", userInput);
      
      if (
        response?.status === 200 || 
        response?.status === 201 || 
        response?.data?.status_code === 200 || 
        response?.data?.status_code === 201 ||
        response?.data
      ) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.errors || "Something went wrong.");
      }
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  message: "",
  masterSidebars: [],
};

const AddSidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    clearSidebarState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Master Sidebars
      .addCase(fetchMasterSidebars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterSidebars.fulfilled, (state, { payload }) => {
        state.loading = false;
        
        // Safely extract the array regardless of response structure
        if (Array.isArray(payload)) {
          state.masterSidebars = payload;
        } else if (Array.isArray(payload?.data)) {
          state.masterSidebars = payload.data;
        } else if (Array.isArray(payload?.result)) {
          state.masterSidebars = payload.result;
        } else if (Array.isArray(payload?.data?.data)) {
          state.masterSidebars = payload.data.data;
        } else {
          state.masterSidebars = [];
        }
        
        state.error = null;
      })
      .addCase(fetchMasterSidebars.rejected, (state, { payload }) => {
        state.error = true;
        state.loading = false;
        state.message =
          typeof payload === "string"
            ? payload
            : payload?.message || "Something went wrong. Try again later.";
      })

      // Create Sub Sidebar
      .addCase(createSubSidebar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubSidebar.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.message = payload;
        state.error = null;
      })
      .addCase(createSubSidebar.rejected, (state, { payload }) => {
        state.error = true;
        state.loading = false;
        state.message =
          typeof payload === "string"
            ? payload
            : payload?.message || "Something went wrong. Try again later.";
      });
  },
});

export const { clearSidebarState } = AddSidebarSlice.actions;
export default AddSidebarSlice.reducer;