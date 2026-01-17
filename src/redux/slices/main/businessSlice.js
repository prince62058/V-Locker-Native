import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi, putApi, putMediaApi } from '../../../services/axios/api';
import { showToast } from '../../../utils/ToastAndroid';

export const getBusinessThunk = createAsyncThunk(
  'business/getBusiness',
  async ({}, { rejectWithValue }) => {
    try {
      const response = await getApi('user/businessProfile');
      console.log('User business api response ---> ', response.data);
      return response?.data?.data;
    } catch (error) {
      // showToast(error)
      rejectWithValue(error);
    }
  },
);

export const updateBusinessThunk = createAsyncThunk(
  'business/updateBusiness',
  async ({ data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await putMediaApi('user/businessProfile', data);
      console.log('User business update api response ---> ', response.data);
      dispatch(getBusinessThunk({}));
      return response?.data?.data;
    } catch (error) {
      showToast(error);
      rejectWithValue(error);
    }
  },
);

const businessSlice = createSlice({
  name: 'business',
  initialState: {
    loading: false,
    updating: false,
    error: null,
    businessData: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getBusinessThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.businessData = action.payload;
      })
      .addCase(getBusinessThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBusinessThunk.pending, (state, action) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBusinessThunk.fulfilled, (state, action) => {
        state.updating = false;
        // state.businessData = action.payload
      })
      .addCase(updateBusinessThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export default businessSlice.reducer;
