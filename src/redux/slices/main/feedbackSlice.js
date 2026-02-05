import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi, postApi } from '../../../services/axios/api';
import { showToast } from '../../../utils/ToastAndroid';

export const getAllFeedbackThunk = createAsyncThunk(
  'feedback/getAllFeedbackThunk',
  async (_, { getState, rejectWithValue }) => {
    const { _id } = getState().auth.user;
    try {
      const response = await getApi(`feedback/${_id}`);
      console.log('customers all feedback api response --->', response.data);
      return response.data?.data;
    } catch (error) {
      console.log('Error fetching feedbacks:', error);
      return rejectWithValue(error);
    }
  },
);

export const getFeedbackDetailsThunk = createAsyncThunk(
  'feedback/getFeedbackDetailsThunk',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getApi(`feedbackDetails/${id}`);
      console.log('customers feedback api response --->', response.data);
      return response.data?.data;
    } catch (error) {
      showToast(error);
      rejectWithValue(error);
    }
  },
);

export const createFeedbackThunk = createAsyncThunk(
  'feedback/createFeedbackThunk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi(`feedback`, data);
      console.log('customers create feedback api response --->', response.data);
      showToast('Feedback submitted successfully!');
      return response.data?.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

const feedbackSlice = createSlice({
  name: 'feedbackSlice',
  initialState: {
    loading: false,
    error: null,
    feedbackData: null,
    feedbackDetails: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllFeedbackThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllFeedbackThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbackData = action.payload;
      })
      .addCase(getAllFeedbackThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFeedbackDetailsThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeedbackDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbackDetails = action.payload;
      })
      .addCase(getFeedbackDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFeedbackThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedbackThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createFeedbackThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default feedbackSlice.reducer;
