import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";


// ======================================================
// GET AWARENESS SUBTOPICS
// ======================================================

export const getAwarenessSubtopics = createAsyncThunk(
  "awarenessSettings/getAwarenessSubtopics",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `goodmood/sidebar/sub-sidebar-list/master-one`
      );

      if (response?.data?.statusCode === 200) {
        return response.data;
      }

      return rejectWithValue(
        response?.data || "Failed to fetch awareness subtopics"
      );

    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message
      );
    }
  }
);


// ======================================================
// TOGGLE AWARENESS STATUS
// ======================================================

export const toggleAwarenessStatus = createAsyncThunk(
  "awarenessSettings/toggleAwarenessStatus",

  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `goodmood/sidebar/sub-toggle-status-master-one/${id}`
      );

      if (response?.data?.statusCode === 200) {
        return response.data;
      }

      return rejectWithValue(
        response?.data || "Failed to toggle status"
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

  subtopicsList: {
    data: [],
  },

  error: null,
};


// ======================================================
// SLICE
// ======================================================

const AwarenessSettingsSlice = createSlice({
  name: "awarenessSettings",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    // ==================================================
    // GET SUBTOPICS
    // ==================================================

    builder

      .addCase(
        getAwarenessSubtopics.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getAwarenessSubtopics.fulfilled,
        (state, action) => {
          state.loading = false;

          state.subtopicsList = action.payload;

          state.error = null;
        }
      )

      .addCase(
        getAwarenessSubtopics.rejected,
        (state, action) => {
          state.loading = false;

          state.error = action.payload;
        }
      );


    // ==================================================
    // TOGGLE STATUS
    // ==================================================

    builder

      .addCase(
        toggleAwarenessStatus.pending,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        toggleAwarenessStatus.fulfilled,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        toggleAwarenessStatus.rejected,
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});


export default AwarenessSettingsSlice.reducer;