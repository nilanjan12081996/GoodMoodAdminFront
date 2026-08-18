import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch master sidebars list
export const fetchMasterSidebars = createAsyncThunk(
  'sidebar/fetchMasterSidebars',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8085/api/goodmood/sidebar/list');
      if (!response.ok) {
        throw new Error('Failed to fetch master sidebars');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || data.content || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to save a new sidebar item
// export const saveSidebar = createAsyncThunk(
//   'sidebar/saveSidebar',
//   async (sidebarData, { rejectWithValue }) => {
//     try {
//       const response = await fetch('http://localhost:8085/api/goodmood/sidebar/add', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(sidebarData),
//       });
//       if (!response.ok) {
//         throw new Error('Failed to save sidebar item');
//       }
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

const AddSidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    masterSidebars: [],
    loading: false,
    submitting: false,
    error: null,
    success: false,
  },
  reducers: {
    resetSidebarState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Master Sidebars
      .addCase(fetchMasterSidebars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterSidebars.fulfilled, (state, action) => {
        state.loading = false;
        state.masterSidebars = action.payload;
      })
      .addCase(fetchMasterSidebars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Sidebar
    //   .addCase(saveSidebar.pending, (state) => {
    //     state.submitting = true;
    //     state.success = false;
    //     state.error = null;
    //   })
    //   .addCase(saveSidebar.fulfilled, (state) => {
    //     state.submitting = false;
    //     state.success = true;
    //   })
    //   .addCase(saveSidebar.rejected, (state, action) => {
    //     state.submitting = false;
    //     state.error = action.payload;
    //   });
  },
});

export default AddSidebarSlice.reducer;