import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";


export const getMainSidebar = createAsyncThunk(
    'getMainSidebar',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/sidebar/main-sidebar-list`);
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

export const updateMainSidebar = createAsyncThunk(
    'updateMainSidebar',
    async ({id,data}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/sidebar/master-update/${id}`,{data});
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

export const getSubSidebar = createAsyncThunk(
    'getSubSidebar',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/sidebar/sub-sidebar-list`);
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

export const updateSubSidebar = createAsyncThunk(
    'updateSubSidebar',
    async ({id,data}, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/sidebar/side-update/${id}`,{data});
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
    mainSidebar:[],
    subSidebar:[],
    updateMainSideBarData:"",
    updateSubSidebarData:""
}
const SidebarSettingSlice=createSlice(
    {
    name:"sidebarsetiings",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(getMainSidebar.pending,(state)=>{
            state.loading=true
            
        })
        .addCase(getMainSidebar.fulfilled,(state,{payload})=>{
            state.loading=false
            state.mainSidebar=payload
            state.error=false
        })
        .addCase(getMainSidebar.rejected,(state,{payload})=>{
            state.loading=false
            state.error=payload
        })
           .addCase(getSubSidebar.pending,(state)=>{
            state.loading=true
            
        })
        .addCase(getSubSidebar.fulfilled,(state,{payload})=>{
            state.loading=false
            state.subSidebar=payload
            state.error=false
        })
        .addCase(getSubSidebar.rejected,(state,{payload})=>{
            state.loading=false
            state.error=payload
        })
              .addCase(updateMainSidebar.pending,(state)=>{
            state.loading=true
            
        })
        .addCase(updateMainSidebar.fulfilled,(state,{payload})=>{
            state.loading=false
            state.updateMainSideBarData=payload
            state.error=false
        })
        .addCase(updateMainSidebar.rejected,(state,{payload})=>{
            state.loading=false
            state.error=payload
        })
        .addCase(updateSubSidebar.pending,(state)=>{
            state.loading=true
            
        })
        .addCase(updateSubSidebar.fulfilled,(state,{payload})=>{
            state.loading=false
            state.updateSubSidebarData=payload
            state.error=false
        })
        .addCase(updateSubSidebar.rejected,(state,{payload})=>{
            state.loading=false
            state.error=payload
        })
    }
    }
)
export default SidebarSettingSlice.reducer;