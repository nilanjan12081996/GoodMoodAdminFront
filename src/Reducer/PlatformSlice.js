import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const createUpdatePlatformCharges=createAsyncThunk(
    'createUpdatePlatformCharges',
    async (userInput, { rejectWithValue }) => {
        try {
          const response = await api.post("goodmood/charges/add-update",userInput);
           if (response?.data?.statusCode === 201||response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
       
        } catch (error) {
          return rejectWithValue(
            error.response?.data || error.message
          );
        }
      }
)
export const getPlatformCharges=createAsyncThunk(
    'getPlatformCharges',
    async ({categoryId}, { rejectWithValue }) => {
        try {
          const response = await api.get(`goodmood/charges/get-charges/${categoryId}`);
          if (response?.data?.statusCode === 201||response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
          return rejectWithValue(
            error.response?.data || error.message
          );
        }
      }
)
const initialState={
    loading:false,
    error:false,
    addUpdateData:"",
    charges:[]
}
const PlatformSlice=createSlice(
    {
        name:'platform',
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
           builder 
           .addCase(createUpdatePlatformCharges.pending,(state)=>{
            state.loading=true
            })
           .addCase(createUpdatePlatformCharges.fulfilled,(state,{payload})=>{
            state.loading=false
            state.addUpdateData=payload
            state.error=false
           })
           .addCase(createUpdatePlatformCharges.rejected,(state,{payload})=>{
            state.loading=false
            state.error=payload
           })
            .addCase(getPlatformCharges.pending,(state)=>{
            state.loading=true
            })
           .addCase(getPlatformCharges.fulfilled,(state,{payload})=>{
            state.loading=false
            state.charges=payload
            state.error=false
           })
           .addCase(getPlatformCharges.rejected,(state,{payload})=>{
            state.loading=false
            state.error=payload
           })
        }
    }
)
export default PlatformSlice.reducer;