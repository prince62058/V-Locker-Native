import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteApi,
  getApi,
  postApi,
  putApi,
} from '../../../services/axios/api';
import { showToast } from '../../../utils/ToastAndroid';

// STATUS - DONE , [IN USE]
export const getLoanListThunk = createAsyncThunk(
  'loan/getLoanListThunk',
  async (
    { isRefresh = false, page = 1, search = '', limit = 10, filter } = {},
    { rejectWithValue },
  ) => {
    const params = { page, limit, search };
    if (filter) {
      params[filter] = true;
    }
    console.log('device params', params);
    try {
      const response = await getApi('customerLoan', { params });
      // console.log('user all loan api response --->', response.data)
      const { data, pagination } = response.data || {};
      return { data, pagination };
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// STATUS - DONE , [IN USE]
export const getLoanDetailsThunk = createAsyncThunk(
  'loan/getLoanDetailsThunk',
  async ({ loanId }, { rejectWithValue }) => {
    try {
      const response = await getApi(`customerLoan/single/${loanId}`);
      console.log('Loan details api response --->', response.data);
      const loan = response.data?.data ?? null;
      return loan;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const updateLoanThunk = createAsyncThunk(
  'loan/updateLoanThunk',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await putApi(`customerLoan/${id}`, data);
      const updated = response.data?.data ?? response.data;
      // refresh list and details
      dispatch(getLoanListThunk({}));
      dispatch(getLoanDetailsThunk({ loanId: id }));
      return updated;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const deleteLoanThunk = createAsyncThunk(
  'loan/deleteLoanThunk',
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await deleteApi(`customerLoan/${id}`);
      showToast('Loan deleted');
      // refresh list
      dispatch(getLoanListThunk({}));
      return id;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const createLoanRecordThunk = createAsyncThunk(
  'loan/createLoanRecordThunk',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi('loans', data);
      const created = response.data?.data ?? response.data;
      // refresh list
      dispatch(getLoanListThunk({}));
      return created;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

const loanSlice = createSlice({
  name: 'loanSlice',
  initialState: {
    loading: {
      loading: false,
      refreshing: false,
      pagination: false,
      search: false,
      filter: false,
    },
    error: null,

    loanData: null, // array or null
    pagination: null, // pagination meta

    loanDetails: null, // object or null

    searchData: null,
    searchPagination: null,
  },
  reducers: {
    clearSearch(state) {
      state.searchData = null;
      state.searchPagination = null;
    },
    clearLoanDetails(state) {
      state.loanDetails = null;
    },
  },
  extraReducers: builder => {
    builder
      // ---- getLoanListThunk ----
      .addCase(getLoanListThunk.pending, (state, action) => {
        const { isRefresh, page, search, filter } = action.meta.arg || {};
        state.error = null;
        state.loading = {
          loading: false,
          refreshing: false,
          pagination: false,
          search: false,
          filter: false,
        };

        if (isRefresh) state.loading.refreshing = true;
        else if (page > 1) state.loading.pagination = true;
        else if (search && search.trim().length > 0)
          state.loading.search = true;
        // else if (filter && filter.trim().length > 0) state.loading.filter = true
        else state.loading.loading = true;

        // clear search storage when search is empty on a base call
        if (!search || search.trim() === '') {
          state.searchData = null;
          state.searchPagination = null;
        }
      })

      .addCase(getLoanListThunk.fulfilled, (state, action) => {
        const { page, search } = action.meta.arg || {};
        state.loading = {
          loading: false,
          refreshing: false,
          pagination: false,
          search: false,
          filter: false,
        };

        const newData = action.payload?.data ?? [];
        const pagination = action.payload?.pagination ?? {};

        if (search && search.trim().length > 0) {
          // handle search list separately
          if (page && page > 1 && Array.isArray(state.searchData)) {
            state.searchData = [...state.searchData, ...newData];
          } else {
            state.searchData = Array.isArray(newData) ? newData : [];
          }
          state.searchPagination = pagination;
        } else {
          // normal loan list
          if (page && page > 1 && Array.isArray(state.loanData)) {
            state.loanData = [...state.loanData, ...newData];
          } else {
            state.loanData = Array.isArray(newData) ? newData : [];
          }
          state.pagination = pagination;
        }
      })

      .addCase(getLoanListThunk.rejected, (state, action) => {
        state.loading = {
          loading: false,
          refreshing: false,
          pagination: false,
          search: false,
          filter: false,
        };
        state.error = action.payload;
      })

      // ---- getLoanDetailsThunk ----
      .addCase(getLoanDetailsThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(getLoanDetailsThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        state.loanDetails = action.payload ?? null;
      })
      .addCase(getLoanDetailsThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- updateLoanThunk ----
      .addCase(updateLoanThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(updateLoanThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(updateLoanThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- deleteLoanThunk ----
      .addCase(deleteLoanThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(deleteLoanThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        // optionally remove from current list immediately if present
        const removedId = action.payload;
        if (removedId) {
          if (Array.isArray(state.loanData)) {
            state.loanData = state.loanData.filter(
              item => item?._id !== removedId,
            );
          }
          if (Array.isArray(state.searchData)) {
            state.searchData = state.searchData.filter(
              item => item?._id !== removedId,
            );
          }
        }
      })
      .addCase(deleteLoanThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- createLoanRecordThunk (optional) ----
      .addCase(createLoanRecordThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(createLoanRecordThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(createLoanRecordThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch, clearLoanDetails } = loanSlice.actions;
export default loanSlice.reducer;
