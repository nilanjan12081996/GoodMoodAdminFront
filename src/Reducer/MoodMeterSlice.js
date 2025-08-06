import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";


export const getMoodMeter = createAsyncThunk(
    'getMoodMeter',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/mood-meter/get-mood-meter`, user_input);
            if (response?.data?.status_code === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const addMoodMeter = createAsyncThunk(
    'addMoodMeter',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/mood-meter/add`, user_input);


            if (response?.data?.status_code === 201) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const getActiveDeactiveMoodMeter = createAsyncThunk(
    'getActiveDeactiveMoodMeter',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/mood-meter/change-status`, user_input);
            if (response?.data?.status_code === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

const initialState = {
    loading: false,
    allMoodMeter: [],
    error: false,
    addMoodMeterData: ""
}
const MoodMeterSlice = createSlice(
    {
        'name': 'levelsData',
        initialState,
        reducers: {},
        extraReducers: (builder) => {
            builder
                .addCase(getMoodMeter.pending, (state) => {
                    state.loading = true
                })
                .addCase(getMoodMeter.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.allMoodMeter = payload
                    state.error = false
                })
                .addCase(getMoodMeter.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(addMoodMeter.pending, (state) => {
                    state.loading = true
                })
                .addCase(addMoodMeter.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.addMoodMeterData = payload
                    state.error = false
                })
                .addCase(addMoodMeter.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
        }
    }

)
export default MoodMeterSlice.reducer;