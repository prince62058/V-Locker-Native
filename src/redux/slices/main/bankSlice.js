import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteApi,
  getApi,
  postApi,
  putApi,
} from '../../../services/axios/api';
import { showToast } from '../../../utils/ToastAndroid';

// ✅ 1. Get all bank data
export const getBankThunk = createAsyncThunk(
  'bank/getBankThunk',
  async ({ isRefresh = false }, { getState, rejectWithValue }) => {
    try {
      const response = await getApi(`bank`);
      console.log('Bank list API response --->', response.data);
      return response.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// ✅ 2. Get single bank profile
export const getBankProfileThunk = createAsyncThunk(
  'bank/getBankProfileThunk',
  async ({ bankId }, { rejectWithValue }) => {
    try {
      const response = await getApi(`bank/single/${bankId}`);
      console.log('Bank details API response --->', response.data);
      return response.data?.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// ✅ 3. Create new bank
export const createBankThunk = createAsyncThunk(
  'bank/createBankThunk',
  async ({ data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi('bank', data);
      console.log('Bank create API response --->', response.data);
      dispatch(getBankThunk({}));
      return response.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// ✅ 4. Update bank details
export const updateBankThunk = createAsyncThunk(
  'bank/updateBankThunk',
  async ({ bankId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await putApi(`bank/${bankId}`, data);
      console.log('Bank update API response --->', response.data);
      dispatch(getBankThunk({}));
      return response.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// ✅ 5. Delete a bank
export const deleteBankThunk = createAsyncThunk(
  'bank/deleteBankThunk',
  async ({ bankId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await deleteApi(`bank/${bankId}`);
      console.log('Bank delete API response --->', response.data);
      dispatch(getBankThunk({}));
      return bankId;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// ✅ Slice
const bankSlice = createSlice({
  name: 'bankSlice',
  initialState: {
    loading: false,
    refreshing: false,
    deleting: false,
    error: null,
    bankData: null,
    bankProfile: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getBankThunk.pending, (state, action) => {
        const { isRefresh } = action.meta.arg;
        if (isRefresh) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(getBankThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.bankData = action.payload;
      })
      .addCase(getBankThunk.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })

      // GET bank profile
      .addCase(getBankProfileThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBankProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bankProfile = action.payload;
      })
      .addCase(getBankProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE bank
      .addCase(createBankThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBankThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createBankThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE bank
      .addCase(updateBankThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(updateBankThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE bank
      .addCase(deleteBankThunk.pending, state => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteBankThunk.fulfilled, state => {
        state.deleting = false;
      })
      .addCase(deleteBankThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export default bankSlice.reducer;
