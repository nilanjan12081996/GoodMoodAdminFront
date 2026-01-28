import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";
export const getSpecialization = createAsyncThunk(
    'getSpecialization',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/specialization`);
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

export const getSingleSpecialization = createAsyncThunk(
    'getSingleSpecialization',
    async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/specialization?id=${id}`);
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
export const addSpecialization = createAsyncThunk(
    'addSpecialization',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/specialization`,user_input);
            if (response?.data?.statusCode === 200||response?.data?.statusCode === 201) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const changeStatus = createAsyncThunk(
    'changeStatus',
    async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/specialization/status/${id}`);
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

export const updateSpecialization = createAsyncThunk(
    'updateSpecialization',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.put(`goodmood/specialization`,user_input);
            if (response?.data?.statusCode === 200||response?.data?.statusCode === 201) {
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
    getList:[],
    addSpecialData:"",
    singleData:{}
}
const SpecializationSlice=createSlice(
    {
        name:'special',
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder
            .addCase(getSpecialization.pending,(state)=>{
                state.loading=true
            })
            .addCase(getSpecialization.fulfilled,(state,{payload})=>{
                state.loading=false
                state.getList=payload
                state.error=false
            })
            .addCase(getSpecialization.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
            .addCase(addSpecialization.pending,(state)=>{
                state.loading=true
            })
            .addCase(addSpecialization.fulfilled,(state,{payload})=>{
                state.loading=false
                state.addSpecialData=payload
                state.error=false
            })
            .addCase(addSpecialization.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
            .addCase(getSingleSpecialization.pending,(state)=>{
                state.loading=true
            })
            .addCase(getSingleSpecialization.fulfilled,(state,{payload})=>{
                state.loading=false
                state.singleData=payload
                state.error=false
            })
            .addCase(getSingleSpecialization.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
        }
    }
)
export default SpecializationSlice.reducer