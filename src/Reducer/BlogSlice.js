import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";


export const getBlog = createAsyncThunk(
    'getBlog',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/post/list`);
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

export const uploadImage = createAsyncThunk(
    'uploadImage',
    async ({ id, user_input }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`goodmood/post/image/${id}`, user_input);
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
export const addBlog = createAsyncThunk(
    'addBlog',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/post/save`, user_input);
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
export const publishUnPublished = createAsyncThunk(
    'publishUnPublished',
    async ({ id }, { rejectWithValue }) => {
        try {

            const response = await api.patch(`goodmood/post/publish/${id}`);

            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getBlogDetails = createAsyncThunk(
    'getBlogDetails',
    async ({ id }, { rejectWithValue }) => {
        try {

            const response = await api.get(`goodmood/post/list?id=${id}`);
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
export const editBlog = createAsyncThunk(
    'editBlog',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/post/edit/${id}`);
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

export const updateBlog = createAsyncThunk(
    'updateBlog',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/post/update`, user_input);
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

export const updateAnswerDetails = createAsyncThunk(
    'updateAnswerDetails',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin-answer-manage/edit`, user_input);
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
export const deleteAnswer = createAsyncThunk(
    'deleteAnswer',
    async (user_input, { rejectWithValue }) => {

        try {
            const response = await api.delete(`/admin-answer-manage/remove`, { data: user_input });
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

export const questionAnswerMap = createAsyncThunk(
    'questionAnswerMap',
    async (user_input, { rejectWithValue }) => {

        try {
            const response = await api.post(`/admin-answer-manage/question-answer-map`, user_input);
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

const initialState = {
    loading: false,
    blogList: [],
    error: false,
    addBlogListData: [],
    singleBlog: {},
    updateBlogData: {},
    updateAnswerData: {},
    deleteAnswerData: {},
    mappeedData: {}
}
const BlogSlice = createSlice(
    {
        name: 'blog',
        initialState,
        reducers: {},
        extraReducers: (builder) => {
            builder.addCase(getBlog.pending, (state) => {
                state.loading = true
            })
                .addCase(getBlog.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.blogList = payload
                    state.error = false
                })
                .addCase(getBlog.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(addBlog.pending, (state) => {
                    state.loading = true
                })
                .addCase(addBlog.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.addBlogListData = payload
                    state.error = false
                })
                .addCase(addBlog.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(getBlogDetails.pending, (state) => {
                    state.loading = true
                })
                .addCase(getBlogDetails.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.singleBlog = payload
                    state.error = false
                })
                .addCase(getBlogDetails.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(editBlog.pending, (state) => {
                    state.loading = true
                })
                .addCase(editBlog.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.singleBlog = payload
                    state.error = false
                })
                .addCase(editBlog.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(updateBlog.pending, (state) => {
                    state.loading = true
                })
                .addCase(updateBlog.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.updateBlogData = payload
                    state.error = false
                })
                .addCase(updateBlog.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(updateAnswerDetails.pending, (state) => {
                    state.loading = true
                })
                .addCase(updateAnswerDetails.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.updateAnswerData = payload
                    state.error = false
                })
                .addCase(updateAnswerDetails.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(deleteAnswer.pending, (state) => {
                    state.loading = true
                })
                .addCase(deleteAnswer.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.deleteAnswerData = payload
                    state.error = false
                })
                .addCase(deleteAnswer.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(questionAnswerMap.pending, (state) => {
                    state.loading = true
                })
                .addCase(questionAnswerMap.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.mappeedData = payload
                    state.error = false
                })
                .addCase(questionAnswerMap.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
        }
    }
)
export default BlogSlice.reducer;