import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getDoctor = createAsyncThunk(
  "doctor/getDoctor",
  async (id, { rejectWithValue }) => {
    try {
      let url = "http://localhost:8085/api/goodmood/doctors/all-doctors";

      // if id is provided, append query param
      if (id) {
        url += `?id=${id}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);
export const approveDoctor=createAsyncThunk(
    'approveDoctor',
     async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/doctors/approve/${id}`, );
            if (response?.data?.statusCode === 201||response?.data?.statusCode === 200) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)
export const toggleStatus=createAsyncThunk(
    'toggleStatus',
     async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/doctors/status/${id}`, );
            if (response?.data?.statusCode === 201||response?.data?.statusCode === 200) {
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
    doctorsDetails:[],
    approveData:""
}
const DoctorSlice=createSlice(
    {
        'name':"doctors",
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder
            .addCase(getDoctor.pending,(state)=>{
                state.loading=true
            })
            .addCase(getDoctor.fulfilled,(state,{payload})=>{
                state.loading=false
                state.doctorsDetails=payload
                state.error=false
            })
            .addCase(getDoctor.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
              .addCase(approveDoctor.pending,(state)=>{
                state.loading=true
            })
            .addCase(approveDoctor.fulfilled,(state,{payload})=>{
                state.loading=false
                state.approveData=payload
                state.error=false
            })
            .addCase(approveDoctor.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
        }
    }
)
export default DoctorSlice.reducer;