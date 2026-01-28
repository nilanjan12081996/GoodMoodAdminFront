import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getParentCategory = createAsyncThunk(
    'getParentCategory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/goodmood/support/category/list/parents`);
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

export const getChildCategory = createAsyncThunk(
    'getChildCategory',
    async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/support/category/list/child?pid=${id}`);
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

export const getSingleChildCategory = createAsyncThunk(
    'getSingleChildCategory',
    async ({id,single_id}, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/support/category/list/child?pid=${id}&&id=${single_id}`);
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

export const cateGoryAddUpdate = createAsyncThunk(
    'cateGoryAddUpdate',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/support/category/add/update`,user_input);
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
            const response = await api.patch(`goodmood/support/category/status/${id}`);
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

export const uploladImage = createAsyncThunk(
    'uploladImage',
    async ({id,user_input}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/support/category/image/${id}`, user_input);
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
    parentcateList:[],
    childCateList:[],
    saveSupport:"",
    singleChildeCateData:{}
}
const SupportSlice=createSlice(
    {
        name:'support',
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder
            .addCase(getParentCategory.pending,(state)=>{
                state.loading=true
            })
            .addCase(getParentCategory.fulfilled,(state,{payload})=>{
                state.loading=false
                console.log("payload",payload);
                
                state.parentcateList=payload
                state.error=false
            })
            .addCase(getParentCategory.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
              .addCase(getChildCategory.pending,(state)=>{
                state.loading=true
            })
            .addCase(getChildCategory.fulfilled,(state,{payload})=>{
                state.loading=false
                console.log("payload",payload);
                
                state.childCateList=payload
                state.error=false
            })
            .addCase(getChildCategory.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
                .addCase(cateGoryAddUpdate.pending,(state)=>{
                state.loading=true
            })
            .addCase(cateGoryAddUpdate.fulfilled,(state,{payload})=>{
                state.loading=false
                state.saveSupport=payload
                state.error=false
            })
            .addCase(cateGoryAddUpdate.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
                  .addCase(getSingleChildCategory.pending,(state)=>{
                state.loading=true
            })
            .addCase(getSingleChildCategory.fulfilled,(state,{payload})=>{
                state.loading=false
                state.singleChildeCateData=payload
                state.error=false
            })
            .addCase(getSingleChildCategory.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
        }
    }
)
export default SupportSlice.reducer