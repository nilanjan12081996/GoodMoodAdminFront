import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";


export const getQuestion = createAsyncThunk(
    'getQuestion',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/question/answer/list`);
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

export const getSingleQuestion = createAsyncThunk(
    'getSingleQuestion',
    async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.get(`goodmood/question/answer/list?id=${id}`);
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
export const addQuestions = createAsyncThunk(
    'addQuestions',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/question/answer/add-edit`, user_input);
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





export const deleteOption = createAsyncThunk(
    'deleteOption',
    async ({id}, { rejectWithValue }) => {
        try {
            const response = await api.delete(`goodmood/question/answer/delete/${id}`);
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
export const changeStatusQuestion = createAsyncThunk(
    'changeStatusQuestion',
    async ({id}, { rejectWithValue }) => {
        try {

            const response = await api.patch(`goodmood/question/answer/status-question/${id}`);

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



export const changeAnswer = createAsyncThunk(
    'changeAnswer',
    async ({id}, { rejectWithValue }) => {
        try {

            const response = await api.put(`goodmood/question/answer/status-ans/${id}`);

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


export const getQuestionDetails = createAsyncThunk(
    'getMoodMasterSingle',
    async ({ user_input }, { rejectWithValue }) => {
        try {
            const id = user_input;
            const response = await api.get(`/admin-question-manage/details/${id}`);
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

export const updateQuestionDetails = createAsyncThunk(
    'updateQuestionDetails',
    async (user_input, { rejectWithValue }) => {
        try {
            const response = await api.post(`goodmood/question/answer/add-edit`, user_input);
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

export const deleteQuestion = createAsyncThunk(
    'deleteQuestion',
    async (user_input, { rejectWithValue }) => {

        try {
            const response = await api.delete(`/admin-question-manage/remove`, { data: user_input });
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

const initialState = {
    loading: false,
    questionList: [],
    error: false,
    addQuestionListData: [],
    singleQuestion: {},
    updateQuestionData: {},
    deleteQueData: {},
    deleteOptionData:{}
}
const QuestionSlice = createSlice(
    {
        name: 'que',
        initialState,
        reducers: {},
        extraReducers: (builder) => {
            builder.addCase(getQuestion.pending, (state) => {
                state.loading = true
            })
                .addCase(getQuestion.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.questionList = payload
                    state.error = false
                })
                .addCase(getQuestion.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(addQuestions.pending, (state) => {
                    state.loading = true
                })
                .addCase(addQuestions.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.addQuestionListData = payload
                    state.error = false
                })
                .addCase(addQuestions.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(getSingleQuestion.pending, (state) => {
                    state.loading = true
                })
                .addCase(getSingleQuestion.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.singleQuestion = payload
                    state.error = false
                })
                .addCase(getSingleQuestion.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(updateQuestionDetails.pending, (state) => {
                    state.loading = true
                })
                .addCase(updateQuestionDetails.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.updateQuestionData = payload
                    state.error = false
                })
                .addCase(updateQuestionDetails.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                .addCase(deleteQuestion.pending, (state) => {
                    state.loading = true
                })
                .addCase(deleteQuestion.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.deleteQueData = payload
                    state.error = false
                })
                .addCase(deleteQuestion.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
                  .addCase(deleteOption.pending, (state) => {
                    state.loading = true
                })
                .addCase(deleteOption.fulfilled, (state, { payload }) => {
                    state.loading = false
                    state.deleteOptionData = payload
                    state.error = false
                })
                .addCase(deleteOption.rejected, (state, { payload }) => {
                    state.loading = false
                    state.error = payload
                })
        }
    }
)
export default QuestionSlice.reducer;