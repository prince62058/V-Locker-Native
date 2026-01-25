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
    { isRefresh = false, page = 1, search = '', limit = 10, ...rest } = {},
    { rejectWithValue },
  ) => {
    const params = { page, limit, search, ...rest };
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

// STATUS - DONE , [IN USE]
export const lockDeviceThunk = createAsyncThunk(
  'loan/lockDeviceThunk',
  async ({ identifier }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Dispatching lock for identifier:', identifier);
      const response = await postApi(`customerLoan/lock/${identifier}`);
      console.log('Lock Device Response:', response.data);
      // refresh list and details (if it's an ID, this works better, otherwise just ignore)
      dispatch(getLoanListThunk({}));
      return response.data;
    } catch (error) {
      console.error('Lock Device Error:', error);
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

// STATUS - DONE , [IN USE]
export const unlockDeviceThunk = createAsyncThunk(
  'loan/unlockDeviceThunk',
  async ({ identifier }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Dispatching unlock for identifier:', identifier);
      const response = await postApi(`customerLoan/unlock/${identifier}`);
      console.log('Unlock Device Response:', response.data);
      // refresh list and details
      dispatch(getLoanListThunk({}));
      return response.data;
    } catch (error) {
      console.error('Unlock Device Error:', error);
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const getMobileDeviceStatusThunk = createAsyncThunk(
  'loan/getMobileDeviceStatusThunk',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await getApi('customerLoan/mobile/status');
      console.log('Mobile Device Status Response:', response.data);
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Mobile Device Status Error:', error);
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const getPublicMobileStatusThunk = createAsyncThunk(
  'loan/getPublicMobileStatusThunk',
  async ({ imei, phone }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Fetching public status for IMEI/Phone:', { imei, phone });
      const response = await getApi('customerLoan/status/public', {
        params: { imei, phone },
      });
      console.log('Public Mobile Status Response:', response.data);

      // Adapt the response to match what the UI expects (if possible)
      // The UI expects 'loan' object with 'totalDueAmount', 'emiAmount', etc.
      // We assume the public API returns this inside 'data' or similar, or we return what we have.
      if (response.data?.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Public Mobile Status Error:', error);
      // Don't show toast for background checks to avoid spamming
      return rejectWithValue(error);
    }
  },
);

export const updateDevicePolicyThunk = createAsyncThunk(
  'loan/updateDevicePolicyThunk',
  async ({ loanId, policy }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Dispatching policy update for loanId:', loanId, policy);
      const response = await postApi(`customerLoan/policy/${loanId}`, policy);
      console.log('Policy Update Response:', response.data);
      // refresh list and details
      dispatch(getLoanListThunk({}));
      dispatch(getLoanDetailsThunk({ loanId }));
      return response.data;
    } catch (error) {
      console.error('Update Policy Error:', error);
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const lockDeviceBulkThunk = createAsyncThunk(
  'loan/lockDeviceBulkThunk',
  async ({ loanIds }, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi('customerLoan/bulk/lock', { loanIds });
      showToast('Bulk lock triggered');
      dispatch(getLoanListThunk({}));
      return response.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const unlockDeviceBulkThunk = createAsyncThunk(
  'loan/unlockDeviceBulkThunk',
  async ({ loanIds }, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi('customerLoan/bulk/unlock', { loanIds });
      showToast('Bulk unlock triggered');
      dispatch(getLoanListThunk({}));
      return response.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const updateDevicePolicyBulkThunk = createAsyncThunk(
  'loan/updateDevicePolicyBulkThunk',
  async ({ loanIds, policy }, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi('customerLoan/bulk/policy', {
        loanIds,
        policy,
      });
      showToast('Bulk policy updated');
      dispatch(getLoanListThunk({}));
      return response.data;
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
      })

      // ---- lockDeviceThunk ----
      .addCase(lockDeviceThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(lockDeviceThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        // Update the item in loanData if it exists
        const loanId = action.meta.arg.identifier; // Assuming identifying by IMEI
        const index = state.loanData.findIndex(
          l => l.imeiNumber1 === loanId || l._id === loanId,
        );
        if (index !== -1) {
          state.loanData[index].deviceUnlockStatus = 'LOCKED';
        }
      })
      .addCase(lockDeviceThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- unlockDeviceThunk ----
      .addCase(unlockDeviceThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(unlockDeviceThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        const loanId = action.meta.arg.identifier;
        const index = state.loanData.findIndex(
          l => l.imeiNumber1 === loanId || l._id === loanId,
        );
        if (index !== -1) {
          state.loanData[index].deviceUnlockStatus = 'UNLOCKED';
        }
      })
      .addCase(unlockDeviceThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- getMobileDeviceStatusThunk ----
      .addCase(getMobileDeviceStatusThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(getMobileDeviceStatusThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        // We can store this in loanDetails or a new field.
        // For simplicity and since lock screen needs details, putting it in loanDetails works
        // if we treat it as the "current active loan".
        state.loanDetails = action.payload ?? null;
      })
      .addCase(getMobileDeviceStatusThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- getPublicMobileStatusThunk ----
      .addCase(getPublicMobileStatusThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(getPublicMobileStatusThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        // The public API might return structure like { success: true, status: '...', loan: { ... } }
        // We map it to loanDetails
        if (action.payload?.loan) {
          state.loanDetails = action.payload.loan;
        } else if (action.payload?.data) {
          state.loanDetails = action.payload.data;
        }
      })
      .addCase(getPublicMobileStatusThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- updateDevicePolicyThunk ----
      .addCase(updateDevicePolicyThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(updateDevicePolicyThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        const { loanId, policy } = action.meta.arg;
        const index = state.loanData.findIndex(l => l._id === loanId);
        if (index !== -1) {
          state.loanData[index].devicePolicy = policy;
        }
      })
      .addCase(updateDevicePolicyThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- lockDeviceBulkThunk ----
      .addCase(lockDeviceBulkThunk.pending, state => {
        state.loading.loading = true;
      })
      .addCase(lockDeviceBulkThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(lockDeviceBulkThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- unlockDeviceBulkThunk ----
      .addCase(unlockDeviceBulkThunk.pending, state => {
        state.loading.loading = true;
      })
      .addCase(unlockDeviceBulkThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(unlockDeviceBulkThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })

      // ---- updateDevicePolicyBulkThunk ----
      .addCase(updateDevicePolicyBulkThunk.pending, state => {
        state.loading.loading = true;
      })
      .addCase(updateDevicePolicyBulkThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(updateDevicePolicyBulkThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch, clearLoanDetails } = loanSlice.actions;
export default loanSlice.reducer;
