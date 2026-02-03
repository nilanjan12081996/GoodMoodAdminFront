import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getallDays=createAsyncThunk(
    'getallDays',
     async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/days/get-all-days`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)
export const daysChangeStatus=createAsyncThunk(
    'daysChangeStatus',
     async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/days/status/${id}`);
            if (response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)
const initialState={
    loading:false,
    error:false,
    alldays:[]
}
const DaysSlice=createSlice(
    {
        name:'days',
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder
            .addCase(getallDays.pending,(state)=>{
                state.loading=true
            })
            .addCase(getallDays.fulfilled,(state,{payload})=>{
                state.loading=false
                state.alldays=payload
                state.error=false
            })
            .addCase(getallDays.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
        }
    }
)
export default DaysSlice.reducer;