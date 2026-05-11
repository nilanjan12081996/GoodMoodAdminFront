import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

export const getAwarenessBlogs = createAsyncThunk(
    'getAwarenessBlogs',
    async ({ id, slug, awarenessId, subsidebarId }, { rejectWithValue }) => {
        try {
            let url = `goodmood/awareness-blog/list`;
            const params = new URLSearchParams();
            if (id) params.append('id', id);
            if (slug) params.append('slug', slug);
            if (awarenessId) params.append('awarenessId', awarenessId);
            if (subsidebarId) params.append('subsidebarId', subsidebarId);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
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

export const addAwarenessBlog = createAsyncThunk(
    'addAwarenessBlog',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/awareness-blog/save`, user_input);
            if (response?.data?.statusCode === 201) {
                return response?.data;
            } else {
                return rejectWithValue(response);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const editAwarenessBlog = createAsyncThunk(
    'editAwarenessBlog',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/awareness-blog/edit/${id}`);
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

export const updateAwarenessBlog = createAsyncThunk(
    'updateAwarenessBlog',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/awareness-blog/update`, user_input);
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

export const toggleAwarenessBlogStatus = createAsyncThunk(
    'toggleAwarenessBlogStatus',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/awareness-blog/toggle-status/${id}`);
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const uploadAwarenessBlogImage = createAsyncThunk(
    'uploadAwarenessBlogImage',
    async ({ id, user_input }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/awareness-blog/image/${id}`, user_input);
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

const initialState = {
    loading: false,
    awarenessBlogList: [],
    singleAwarenessBlog: {},
    error: false,
    addAwarenessBlogData: {},
    updateAwarenessBlogData: {},
}

const AwarenessBlogSlice = createSlice({
    name: 'awarenessBlog',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAwarenessBlogs.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAwarenessBlogs.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.awarenessBlogList = payload;
                state.error = false;
            })
            .addCase(getAwarenessBlogs.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(addAwarenessBlog.pending, (state) => {
                state.loading = true;
            })
            .addCase(addAwarenessBlog.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.addAwarenessBlogData = payload;
                state.error = false;
            })
            .addCase(addAwarenessBlog.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(editAwarenessBlog.pending, (state) => {
                state.loading = true;
            })
            .addCase(editAwarenessBlog.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.singleAwarenessBlog = payload;
                state.error = false;
            })
            .addCase(editAwarenessBlog.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(updateAwarenessBlog.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAwarenessBlog.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.updateAwarenessBlogData = payload;
                state.error = false;
            })
            .addCase(updateAwarenessBlog.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
    }
})

export default AwarenessBlogSlice.reducer;
