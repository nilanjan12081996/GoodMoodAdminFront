import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";


export const dynamicSidebar = createAsyncThunk(
    'dynamicSidebar',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('goodmood/sidebar/list');
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                if (response?.data?.errors) {
                    return rejectWithValue(response.data.errors);
                } else {
                    return rejectWithValue('Something went wrong.');
                }
            }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
)

const initialState={
    loading:false,
    sidebarData:[],
    error:false
}
const SidebarSlice=createSlice(
    {
        name:'sidebars',
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder.addCase(dynamicSidebar.pending,(state)=>{
                state.loading=true
            })
            .addCase(dynamicSidebar.fulfilled,(state,{payload})=>{
                state.loading=false
                state.sidebarData=payload
                state.error=false

            })
            .addCase(dynamicSidebar.rejected,(state,{payload})=>{
                state.loading=false
                state.error=payload
            })
        }
    }
)
export default SidebarSlice.reducer;