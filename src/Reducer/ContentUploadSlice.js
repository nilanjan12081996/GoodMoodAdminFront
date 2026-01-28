import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const uploadContent=createAsyncThunk(
    'uploadContent',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/equalizer/upload`, user_input);
            if (response?.data?.statusCode === 200 ||response?.data?.statusCode === 201) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const contentList=createAsyncThunk(
    'contentList',
    async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/equalizer/list?awid=${id}`);
            if (response?.data?.statusCode === 200 ||response?.data?.statusCode === 201) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const contentListSingle=createAsyncThunk(
    'contentListSingle',
    async ({id,cid}, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/equalizer/list?awid=${id}&&id=${cid}`);
            if (response?.data?.statusCode === 200 ||response?.data?.statusCode === 201) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const contentUpdate=createAsyncThunk(
    'contentUpdate',
    async ({id,file}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/equalizer/banner/update?id=${id}`,file);
            if (response?.data?.statusCode === 200 ||response?.data?.statusCode === 201) {
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
    contentUploadData:"",
    allContent:[],
    updateBanner:"",
    singleContent:{}
}
const ContentUploadSlice=createSlice(
    {
        name:"content",
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder
            .addCase(uploadContent.pending,(state)=>{
                state.loading=true
            })
            .addCase(uploadContent.fulfilled,(state,{payload})=>{
                state.loading=false
                state.contentUploadData=payload
                state.error=false
            })
            .addCase(uploadContent.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
               .addCase(contentList.pending,(state)=>{
                state.loading=true
            })
            .addCase(contentList.fulfilled,(state,{payload})=>{
                state.loading=false
                state.allContent=payload
                state.error=false
            })
            .addCase(contentList.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
            .addCase(contentListSingle.pending,(state)=>{
                state.loading=true
            })
            .addCase(contentListSingle.fulfilled,(state,{payload})=>{
                state.loading=false
                state.singleContent=payload
                state.error=false
            })
            .addCase(contentListSingle.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
              .addCase(contentUpdate.pending,(state)=>{
                state.loading=true
            })
            .addCase(contentUpdate.fulfilled,(state,{payload})=>{
                state.loading=false
                state.updateBanner=payload
                state.error=false
            })
            .addCase(contentUpdate.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
        }
    }
)
export default ContentUploadSlice.reducer;